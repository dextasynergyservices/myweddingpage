import { resend } from "@/lib/resend";

export async function sendWeddingCongratulationsEmail({
  to,
  groomName,
  brideName,
  weddingDate,
  isWeddingDay,
  weddingPageSlug,
}: {
  to: string;
  groomName: string;
  brideName: string;
  weddingDate: Date;
  isWeddingDay: boolean;
  weddingPageSlug?: string;
}) {
  const subject = isWeddingDay
    ? "🎉 Congratulations on Your Wedding Day!"
    : "💕 Tomorrow is Your Big Day!";

  const formattedDate = weddingDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const pageLink = weddingPageSlug ? `${process.env.NEXT_PUBLIC_APP_URL}/${weddingPageSlug}` : null;

  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fef7f0 0%, #fdf2f8 100%); border-radius: 12px; overflow: hidden;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #e11d48 0%, #db2777 100%); color: white; text-align: center; padding: 40px 20px;">
        ${
          isWeddingDay
            ? `<h1 style="margin: 0; font-size: 32px; font-weight: bold;">🎉 It's Your Wedding Day! 🎉</h1>`
            : `<h1 style="margin: 0; font-size: 28px; font-weight: bold;">💕 Tomorrow is Your Big Day! 💕</h1>`
        }
      </div>

      <!-- Main Content -->
      <div style="padding: 40px 30px;">
        <h2 style="color: #be123c; font-size: 24px; margin-bottom: 20px; text-align: center;">
          Dear ${groomName} & ${brideName},
        </h2>

        ${
          isWeddingDay
            ? `
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 20px; color: #be123c; font-weight: bold; margin: 0;">
              🌟 TODAY IS THE DAY! 🌟
            </p>
          </div>

          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            What an incredible milestone! Today, you begin your beautiful journey together as husband and wife.
            This is the day you've been planning for, dreaming about, and we couldn't be more excited for you both.
          </p>

          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            As you exchange vows and celebrate with your loved ones, know that your love story is truly special.
            May your wedding day be filled with joy, laughter, and unforgettable moments that you'll treasure forever.
          </p>
        `
            : `
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 18px; color: #be123c; font-weight: bold; margin: 0;">
              ✨ Less Than 24 Hours to Go! ✨
            </p>
          </div>

          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Tomorrow is going to be absolutely magical! We wanted to reach out and send you our warmest wishes
            as you prepare for your special day. All the planning, all the excitement, it all leads to this moment.
          </p>

          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Take a moment tonight to breathe, relax, and soak in the anticipation. Tomorrow, you'll begin
            your beautiful journey as a married couple, and we couldn't be more thrilled for you both!
          </p>
        `
        }

        <!-- Wedding Details Box -->
        <div style="background-color: white; border: 2px solid #fce7f3; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
          <h3 style="color: #be123c; margin-top: 0; font-size: 18px;">💒 Wedding Details</h3>
          <p style="margin: 10px 0; color: #374151;">
            <strong>Date:</strong> ${formattedDate}
          </p>
          ${
            pageLink
              ? `
            <p style="margin: 15px 0;">
              <a href="${pageLink}"
                 style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Your Wedding Page
              </a>
            </p>
          `
              : ""
          }
        </div>

        <!-- Blessings Section -->
        <div style="background: linear-gradient(135deg, #fef7f0 0%, #fdf2f8 100%); border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
          <h3 style="color: #be123c; margin-top: 0; font-size: 18px;">🙏 Our Blessings for You</h3>
          <p style="color: #374151; font-style: italic; line-height: 1.6; margin-bottom: 0;">
            "May your love story be filled with endless chapters of joy, adventure, and deep connection.
            May you always find reasons to laugh together, strength to support each other, and
            countless moments that remind you why you fell in love. Here's to a lifetime of happiness,
            beautiful memories, and a love that grows stronger with each passing day."
          </p>
        </div>

        ${
          isWeddingDay
            ? `
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong>Enjoy every single moment today!</strong> From getting ready in the morning to your first dance
            as a married couple, each moment is precious. Don't forget to take it all in and create memories
            that will last a lifetime.
          </p>
        `
            : `
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong>Final reminders for tomorrow:</strong> Remember to stay hydrated, eat something before the ceremony,
            and most importantly - enjoy every moment! Your wedding day will fly by, so take time to pause and
            soak in all the love surrounding you.
          </p>
        `
        }

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #be123c; font-size: 18px; font-weight: bold; margin-bottom: 10px;">
            ${isWeddingDay ? "Congratulations Mr. & Mrs.!" : "With all our love and best wishes,"}
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            The MyWeddingPage Team 💕
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          You're receiving this because your wedding is ${isWeddingDay ? "today" : "tomorrow"}!
          We're honored to be part of your special journey.
        </p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `MyWeddingPage <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send wedding congratulations email:", error);
    return { success: false, error };
  }
}
