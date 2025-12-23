import { db } from "@/lib/db/drizzle";
import { otpCodes } from "@/lib/db/schema";
import crypto from "crypto";
import { Resend } from "resend";
import { eq } from "drizzle-orm";

const generateOTP = () => crypto.randomInt(100000, 999999).toString();
const resend = new Resend(process.env.AUTH_RESEND_KEY);

const sendOTPEmail = async (email: string, otp: string) => {
  const subject = "Your Mathrix OTP Code";
  const message = `Your Mathrix OTP code is: ${otp}. It will expire in 5 minutes.`;

  await resend.emails.send({
    from: "noreply@nizaralghifary.my.id",
    to: email,
    subject,
    text: message,
  });
};

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return new Response(JSON.stringify({ error: "Missing Email!" }), { status: 400 });
  }

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const existingOtp = await db
    .select()
    .from(otpCodes)
    .where(eq(otpCodes.email, email))
    .limit(1);

  if (existingOtp.length && new Date(existingOtp[0].expires_at) > new Date()) {
    return new Response(JSON.stringify({ error: "OTP already sent, please wait." }), {
      status: 429,
    });
  }

  const otp = generateOTP();

  try {
    await db.delete(otpCodes).where(eq(otpCodes.email, email));

    await Promise.all([
      db.insert(otpCodes).values({ email, code: otp, expires_at: expiresAt.toISOString() }),
      sendOTPEmail(email, otp),
    ]);

    return new Response(JSON.stringify({ message: "Your OTP has been sent" }), { status: 200 });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return new Response(JSON.stringify({ error: "Failed to send OTP!" }), { status: 500 });
  }
}