import { db } from "@/lib/db/drizzle";
import { otpCodes } from "@/lib/db/schema";
import crypto from "crypto";
import { Resend } from "resend";
import { eq } from "drizzle-orm";

const generateOTP = () => crypto.randomInt(100000, 999999).toString();
const resend = new Resend(process.env.AUTH_RESEND_KEY);
const COOLDOWN_SECONDS = 120;

const hashOtp = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");

const sendOTPEmail = async (email: string, otp: string) => {
  const subject = "Your Knot OTP Code";
  const message = `Your Knot OTP code is: ${otp}. It will expire in 5 minutes`;

  await resend.emails.send({
    from: "Knot Verification <auth@nizaralghifary.my.id>",
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

  const [existingOtp] = await db
    .select()
    .from(otpCodes)
    .where(eq(otpCodes.email, email))
    .limit(1);

  if (existingOtp) {
    const createdAt = new Date(existingOtp.created_at || existingOtp.expires_at);
    const now = new Date();
    const secondsSinceLastOtp = Math.floor((now.getTime() - createdAt.getTime()) / 1000);
    
    if (secondsSinceLastOtp < COOLDOWN_SECONDS) {
      const remainingSeconds = COOLDOWN_SECONDS - secondsSinceLastOtp;
      return new Response(JSON.stringify({ 
        error: `Please wait ${remainingSeconds} seconds before requesting a new OTP` 
      }), { status: 429 });
    }
    
    await db.delete(otpCodes).where(eq(otpCodes.email, email));
  }

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const otp = generateOTP();
  const hashedOtp = hashOtp(otp);

  try {
    await db.insert(otpCodes).values({ 
      email, 
      code: hashedOtp, 
      expires_at: expiresAt,
      created_at: new Date()
    });

    await sendOTPEmail(email, otp);

    return new Response(JSON.stringify({ 
      message: "Your OTP has been sent"
    }), { status: 200 });
    
  } catch (error) {
    console.error("Error sending OTP:", error);
    return new Response(JSON.stringify({ error: "Failed to send OTP!" }), { status: 500 });
  }
}