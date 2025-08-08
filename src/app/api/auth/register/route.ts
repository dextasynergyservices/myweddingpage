import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import { generateVerificationDetails } from "@/lib/generateVerification";
import { sendWhatsAppVerification } from "@/lib/sendWhatsAppVerification";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const groomName = formData.get("groomName") as string;
    const brideName = formData.get("brideName") as string;
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const whatsapp = (formData.get("whatsapp") as string)?.trim();
    const weddingDate = formData.get("weddingDate") as string;
    const password = formData.get("password") as string;
    const imageFile = formData.get("image") as File | null;

    if (!groomName || !brideName || !email || !whatsapp || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser || existingUser.status !== "PAID") {
      return NextResponse.json(
        { error: "No valid subscription found for this email" },
        { status: 404 }
      );
    }

    // Prevent duplicate WhatsApp number usage
    if (existingUser.whatsapp && existingUser.whatsapp !== whatsapp) {
      const phoneExists = await prisma.user.findUnique({ where: { whatsapp } });
      if (phoneExists && phoneExists.email !== email) {
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
      where: { email },
      data: {
        groomName,
        brideName,
        whatsapp,
        password: hashedPassword,
        weddingDate: weddingDate ? new Date(weddingDate) : undefined,
        image: imageUrl,
        verification_token: token,
        verification_code: code,
        emailVerified: null,
      },
    });

    console.log("Received:", {
      groomName,
      brideName,
      email,
      whatsapp,
      weddingDate,
      password,
      imageFile,
    });

    await sendVerificationEmail(email, code, token, groomName, brideName);

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
