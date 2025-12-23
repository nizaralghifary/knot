/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send OTP");

      localStorage.setItem("verifyEmail", email);

      toast("OTP Sent!", { description: "Check your email for the OTP." });

      router.push("/verify/otp");
    } catch (error: any) {
      toast("Request Failed!", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="p-5 md:p-8 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">Enter your email to receive an OTP</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-2">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              required
              disabled={loading}
            />

            <Button size="lg" type="submit" disabled={loading} className="mt-2">
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}