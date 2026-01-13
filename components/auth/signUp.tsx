/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Spinner } from "@/components/spinner";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agree) {
      toast("Hold on!", { 
        description: "You must agree to the ToS and Privacy Policy!" 
      });
      return;
    }

    setLoading(true);

    try {
      if (DEMO_MODE) {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to sign up");

        toast("Account created!", { 
          description: "Your account has been successfully created (Demo Mode)" 
        });
        
        setTimeout(() => {
          router.push("/sign-in");
        }, 1500);
        
        return;
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to sign up");

      toast("Account created!", { 
        description: "Your account has been successfully created" 
      });

      localStorage.setItem("email", email);

      const otpResponse = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const otpData = await otpResponse.json();
      
      if (!otpResponse.ok) {
        throw new Error(otpData.error || "Failed to send OTP!");
      }

      toast("OTP Sent!", { 
        description: "Check your email for the OTP" 
      });
      
      setOtpModal(true);
    } catch (error: any) {
      toast("Sign up failed!", { 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (DEMO_MODE) {
      toast("Demo Mode", { 
        description: "OTP verification is skipped in demo mode" 
      });
      router.push("/sign-in");
      return;
    }

    setOtpLoading(true);
    const email = localStorage.getItem("email");

    if (!email || otp.length !== 6) {
      toast("Invalid OTP!", { 
        description: "Please enter a valid 6-digit OTP" 
      });
      setOtpLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invalid OTP!");

      toast("Account Verified!", { 
        description: "Your account has been verified" 
      });
      localStorage.removeItem("email");
      router.push("/sign-in");
    } catch (error: any) {
      toast("Verification Failed!", { 
        description: error.message 
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    const email = localStorage.getItem("email");
    if (!email) return;

    setResendLoading(true);
    
    try {
      const response = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP!");
      }

      toast("OTP Resent!", { 
        description: "A new OTP has been sent to your email" 
      });
      setOtp("");
    } catch (error: any) {
      toast("Failed to resend OTP!", { 
        description: error.message 
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleAutoVerify = () => {
    if (otp.length === 6) {
      handleVerifyOTP();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="p-5 md:p-8 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            {DEMO_MODE ? (
              <span className="text-amber-600 font-medium">
                Demo Mode: OTP verification is disabled
              </span>
            ) : (
              "Create your account"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="flex flex-col gap-2">
            <Input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Username" 
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
                disabled={loading}
              />
              <button 
                type="button" 
                className="px-3" 
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex items-start gap-2 text-sm mt-2">
              <Checkbox 
                checked={agree} 
                onCheckedChange={(v) => setAgree(!!v)} 
              />
              <p className="text-muted-foreground">
                I agree to the{" "}
                <a href="/terms" className="underline">Terms of Service</a>{" "}
                and{" "}
                <a href="/privacy" className="underline">Privacy Policy</a>.
              </p>
            </div>

            <Button 
              size="lg" 
              type="submit" 
              disabled={loading || !agree} 
              className="mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Loading...
                </div>
              ) : "Register"}
            </Button>

            <p className="text-center text-sm mt-2">
              Already have an account?{" "}
              <button 
                type="button" 
                className="underline" 
                onClick={() => router.push("/sign-in")}
                disabled={loading}
              >
                Sign In
              </button>
            </p>
          </form>
        </CardContent>
      </Card>

      {!DEMO_MODE && (
        <Dialog open={otpModal} onOpenChange={setOtpModal}>
          <DialogContent className="flex flex-col items-center w-full max-w-sm">
            <DialogHeader className="text-center">
              <DialogTitle>Verify Your Email</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code sent to your email
              </DialogDescription>
            </DialogHeader>
            
            <div className="my-4">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  if (value.length === 6) {
                    handleAutoVerify();
                  }
                }}
                disabled={otpLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button 
              onClick={handleVerifyOTP} 
              disabled={otpLoading || otp.length !== 6} 
              className="w-full"
              size="lg"
            >
              {otpLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Verifying...
                </div>
              ) : "Verify OTP"}
            </Button>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="outline"
                onClick={handleResendOTP}
                disabled={resendLoading || otpLoading}
                size="sm"
              >
                {resendLoading ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Sending...
                  </div>
                ) : "Resend OTP"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Check your spam folder if you don't see the email
            </p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}