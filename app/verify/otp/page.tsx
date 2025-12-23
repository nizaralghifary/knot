/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const router = useRouter();

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;

    if (/[^0-9]/.test(value)) return;

    setOtp((prevOtp) => {
      const newOtp = [...prevOtp];
      newOtp[index] = value;
      return newOtp;
    });
  };

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("Text");

    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
    }
  };

  const handleVerifyOTP = async () => {
    setOtpLoading(true);
    const otpCode = otp.join("");
    const email = localStorage.getItem("verifyEmail");

    if (!email) {
      toast("Error!", { description: "Email not found. Please request OTP first." });
      setOtpLoading(false);
      return;
    }

    if (otpCode.length !== 6 || otpCode.includes(" ")) {
      toast("Please enter the full OTP", { description: "Make sure to enter a 6-digit OTP." });
      setOtpLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invalid OTP!");

      toast("Account Verified!", { description: "Your account has been verified successfully." });
      localStorage.removeItem("verifyEmail");
      router.push("/sign-in")
    } catch (error: any) {
      toast("Verification Failed!", { description: error.message });
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="p-5 md:p-8 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-center">Verify OTP</CardTitle>
          <CardDescription className="text-center">Enter the OTP sent to your email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-2">
            {otp.map((_, index) => (
              <Input
                key={index}
                type="text"
                maxLength={1}
                value={otp[index]}
                onChange={(e) => handleOtpChange(e, index)}
                onPaste={handlePasteOtp}
                className="w-12 h-12 text-center text-2xl border rounded-md"
                inputMode="numeric"
              />
            ))}
          </div>

          <Button onClick={handleVerifyOTP} disabled={otpLoading} className="w-full mt-5 flex justify-center items-center">
            {otpLoading ? "Verifying..." : "Verify OTP"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}