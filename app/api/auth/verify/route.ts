import { db } from "@/lib/db/drizzle";
import { otpCodes, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const hashOtp = (otp: string) =>
crypto.createHash("sha256").update(otp).digest("hex");

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return new Response(JSON.stringify({ error: "Missing email or OTP!" }), {
      status: 400,
    });
  }

  const [storedOtp] = await db
    .select()
    .from(otpCodes)
    .where(eq(otpCodes.email, email))
    .limit(1);

  if (!storedOtp) {
    return new Response(JSON.stringify({ error: "OTP not found!" }), {
      status: 400
    });
  }

  if (new Date() > new Date(storedOtp.expires_at)) {
    await db.delete(otpCodes).where(eq(otpCodes.email, email));
    return new Response(JSON.stringify({ error: "OTP expired!" }), {
      status: 400
    });
  }

  if (storedOtp.attempts >= 5) {
      await db.delete(otpCodes).where(eq(otpCodes.email, email));
      return Response.json({ error: "Too many attempts!" }, { status: 429 });
  }

  const incomingHash = hashOtp(otp);

  if (storedOtp.code !== incomingHash) {
    await db
      .update(otpCodes)
      .set({ attempts: storedOtp.attempts + 1 })
      .where(eq(otpCodes.id, storedOtp.id));

    return Response.json({ error: "Invalid OTP!" }, { status: 400 });
  }

  await db
    .update(users)
    .set({ is_verified: true })
    .where(eq(users.email, email));

  await db
    .delete(otpCodes)
    .where(eq(otpCodes.email, email));

  return new Response(
    JSON.stringify({ message: "OTP verified successfully" }),
    { status: 200 }
  );
}