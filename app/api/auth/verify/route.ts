import { db } from "@/lib/db/drizzle";
import { otpCodes, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return new Response(JSON.stringify({ error: "Missing email or OTP!" }), {
      status: 400,
    });
  }

  const storedOtp = await db
    .select()
    .from(otpCodes)
    .where(eq(otpCodes.email, email))
    .limit(1);

  if (!storedOtp.length || storedOtp[0].code !== otp) {
    return new Response(JSON.stringify({ error: "Invalid OTP!" }), {
      status: 400,
    });
  }

  await db
    .update(users)
    .set({ is_verified: true })
    .where(eq(users.email, email));

  await db.delete(otpCodes).where(eq(otpCodes.email, email));

  return new Response(
    JSON.stringify({ message: "OTP verified successfully" }),
    { status: 200 }
  );
}