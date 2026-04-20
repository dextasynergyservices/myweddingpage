import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import { generateVerificationDetails } from "@/lib/generateVerification";
import { sendWhatsAppVerification } from "@/lib/sendWhatsAppVerification";
import { registerSchema } from "@/lib/validators";
import { sanitizeHTML, sanitizeEmail, sanitizePhone } from "@/lib/sanitize";
import { validatePassword } from "@/lib/passwordValidator";
import { verifyRecaptchaV3 } from "@/lib/recaptcha";
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit";

// Apply strict rate limiting to registration (5 requests per 15 minutes per IP)
const registerRateLimit = rateLimit({
  ...rateLimitConfigs.auth,
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
  message: "Too many registration attempts. Please try again later.",
});

export async function POST(req: Request) {
  try {
    // Apply rate limiting first
    const rateLimitResponse = await registerRateLimit(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const formData = await req.formData();

    const groomName = formData.get("groomName") as string;
    const brideName = formData.get("brideName") as string;
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const whatsapp = (formData.get("whatsapp") as string)?.trim();
    const weddingDate = formData.get("weddingDate") as string;
    const password = formData.get("password") as string;
    const imageFile = formData.get("image") as File | null;
    const recaptchaToken = formData.get("recaptchaToken") as string;

    // Verify reCAPTCHA v3 (minimum score: 0.6 for registration)
    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptchaV3(recaptchaToken, "register", 0.6);
      if (!recaptchaResult.success) {
        return NextResponse.json(
          { error: "reCAPTCHA verification failed. Please try again." },
          { status: 400 }
        );
      }
    }

    // Validate password strength
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return NextResponse.json(
          {
            error: "Password does not meet security requirements",
            details: passwordValidation.errors,
            suggestions: passwordValidation.suggestions,
          },
          { status: 400 }
        );
      }
    }

    // Sanitize inputs
    const sanitizedGroomName = groomName ? sanitizeHTML(groomName) : "";
    const sanitizedBrideName = brideName ? sanitizeHTML(brideName) : "";
    const sanitizedEmail = email ? sanitizeEmail(email) : "";
    const sanitizedWhatsapp = whatsapp ? sanitizePhone(whatsapp) : "";

    // Validate with Zod schema
    const validationResult = registerSchema.safeParse({
      groomName: sanitizedGroomName,
      brideName: sanitizedBrideName,
      email: sanitizedEmail,
      whatsapp: sanitizedWhatsapp,
      password,
      weddingDate: weddingDate || "",
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    // Use validated data from this point
    const validatedData = validationResult.data;

    if (
      !validatedData.groomName ||
      !validatedData.brideName ||
      !validatedData.email ||
      !validatedData.whatsapp ||
      !validatedData.password
    ) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!existingUser || existingUser.status !== "PAID") {
      return NextResponse.json(
        { error: "No valid subscription found for this email" },
        { status: 404 }
      );
    }

    // Prevent duplicate WhatsApp number usage
    if (existingUser.whatsapp && existingUser.whatsapp !== validatedData.whatsapp) {
      const phoneExists = await prisma.user.findUnique({
        where: { whatsapp: validatedData.whatsapp },
      });
      if (phoneExists && phoneExists.email !== validatedData.email) {
        return NextResponse.json({ error: "WhatsApp number already used" }, { status: 409 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl = null;

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64Image = buffer.toString("base64");

      const upload = await cloudinary.uploader.upload(
        `data:${imageFile.type};base64,${base64Image}`,
        {
          folder: "myweddingpage/users",
        }
      );

      imageUrl = upload.secure_url;
    }

    const { token, code } = generateVerificationDetails();

    const user = await prisma.user.update({
      where: { email: validatedData.email },
      data: {
        groomName: validatedData.groomName,
        brideName: validatedData.brideName,
        whatsapp: validatedData.whatsapp,
        password: hashedPassword,
        weddingDate: validatedData.weddingDate ? new Date(validatedData.weddingDate) : undefined,
        image: imageUrl,
        verification_token: token,
        verification_code: code,
        emailVerified: null,
      },
    });

    // Log successful registration (without sensitive data)
    console.log("User registered:", {
      email: user.email,
      userId: user.id,
      hasImage: !!imageUrl,
    });

    await sendVerificationEmail(
      validatedData.email,
      code,
      token,
      validatedData.groomName,
      validatedData.brideName
    );

    try {
      await sendWhatsAppVerification({
        phoneNumber: user.whatsapp!,
        code,
        token,
      });
    } catch (err) {
      console.error("Failed to send WhatsApp verification:", err);
    }

    return NextResponse.json({
      message: "User created. Verification sent via email and WhatsApp.",
    });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
