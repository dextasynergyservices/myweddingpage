import Twilio from "twilio";

export class WhatsAppService {
  private static getClient() {
    const twilioAccountSid =
      process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

    if (!twilioAccountSid || !twilioAuthToken) {
      return null;
    }

    try {
      return Twilio(twilioAccountSid, twilioAuthToken);
    } catch (error) {
      console.error("Failed to initialize Twilio client:", error);
      return null;
    }
  }

  static async sendMessage({ to, message }: { to: string; message: string }) {
    try {
      const client = this.getClient();

      if (!client || !process.env.TWILIO_WHATSAPP_NUMBER) {
        console.warn("Twilio not configured. WhatsApp message skipped.");
        return false;
      }

      // Clean and validate phone number
      const cleanedNumber = this.cleanPhoneNumber(to);
      if (!this.isValidPhoneNumber(cleanedNumber)) {
        throw new Error("Invalid phone number format");
      }

      const response = await client.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${cleanedNumber}`,
      });

      console.log("WhatsApp message sent:", response.sid);
      return true;
    } catch (error) {
      console.error("Failed to send WhatsApp message:", error);
      throw error; // Re-throw to handle in the calling function
    }
  }

  private static cleanPhoneNumber(phone: string): string {
    // Remove all non-digit characters except leading +
    return phone.replace(/[^\d+]/g, "");
  }

  private static isValidPhoneNumber(phone: string): boolean {
    // Basic validation - adjust according to your needs
    return /^\+[\d]{10,15}$/.test(phone);
  }
}
