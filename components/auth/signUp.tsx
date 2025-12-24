/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MATHRIX_TOKEN}`,
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to sign up");

      toast("Account created!", { description: "Your account has been successfully created." });

      localStorage.setItem("email", email);

      const otpResponse = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!otpResponse.ok) throw new Error("Failed to send OTP!");

      toast("OTP Sent!", { description: "Check your email for the OTP." });

      setOtpModal(true);
    } catch (error: any) {
      toast("Sign up failed!", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

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
    const email = localStorage.getItem("email");

    if (!email) {
      toast("Error!", { description: "Email not found. Please sign up again." });
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
      localStorage.removeItem("email");
      router.push("/sign-in");
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
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="flex flex-col gap-2">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              type="text"
              required
              disabled={loading}
            />
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              required
              disabled={loading}
            />

            <div className="flex items-center border rounded-lg overflow-hidden">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                required
                className="border"
                disabled={loading}
              />
              <button type="button" className="px-3" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button size="lg" type="submit" disabled={loading} className="mt-2">
              {loading ? "Loading..." : "Register"}
            </Button>

            <p className="text-center text-sm mt-2">
              Already have an account?{" "}
              <button
                type="button"
                className="underline"
                onClick={() => router.push("/sign-in")}
              >
                Sign In
              </button>
            </p>
          </form>
        </CardContent>
      </Card>

      <Dialog open={otpModal} onOpenChange={setOtpModal}>
        <DialogContent className="flex flex-col items-center">
          <DialogHeader>
            <DialogTitle className="text-center">Enter OTP</DialogTitle>
          </DialogHeader>
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

          <Button onClick={handleVerifyOTP} disabled={otpLoading} className="mt-2">
            {otpLoading ? "Verifying..." : "Verify OTP"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}