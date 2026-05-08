import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async (to, subject, text) => {
  try {
    // If we're on the free tier of Resend, we can only send to the email 
    // associated with the account, OR we must use the onboarding address.
    const { data, error } = await resend.emails.send({
      from: 'TicketWise <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      text: text,
    });

    if (error) {
      console.error("❌ Resend error:", error.message);
      throw new Error(error.message);
    }

    console.log("✅ Email sent via Resend:", data.id);
    return data;
  } catch (error) {
    console.error("❌ Mail error:", error.message);
    throw error;
  }
};
