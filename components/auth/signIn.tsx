/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/spinner";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        username, 
        password,
        redirect: false,
      });

      if (result?.error) {
        toast("Login failed!", {
          description: "Invalid username or password!",
        });
      } else {
        toast("Successfully login", {
          description: "Welcome back!",
        });
        router.push("/");
      }
    } catch (err) {
      toast("Error!", {
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-5 md:p-8">
      <CardHeader>
        <CardTitle className="text-xl">Sign In</CardTitle>
        <CardDescription>Enter your username and password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignIn} className="flex flex-col gap-2">
          <Input
            value={username}
            disabled={loading}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            type="text"
            required
          />
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Input
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              required
              className="border"
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button size="lg" type="submit" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                Loading...
              </div>
            ) : (
              "Login"
            )}
          </Button>
        </form>
        <Separator className="my-4" />
        <p className="text-center text-muted-foreground text-sm mt-4">
          Don&apos;t have an account?{" "}
          <a href="/sign-up" className="text-black dark:text-white underline">
            Sign Up
          </a>
        </p>
      </CardContent>
    </Card>
  );
}