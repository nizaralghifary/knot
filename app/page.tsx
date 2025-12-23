/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import packageJson from "@/package.json";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession({
     required: true,
     onUnauthenticated() {
       router.push("/sign-in");
     }
  });

  const handleLogout = () => {
    router.push("/sign-out");
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen font-semibold">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col">
      <div className="flex-1 space-y-4 px-8 py-6 lg:gap-10 lg:px-0 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
        <div className="mx-auto w-full min-w-0 max-w-2xl space-y-4">
          <header>
            <p className="text-3xl font-semibold">Frontend Test</p>
          </header>
          <section className="space-y-2">
            <div>
              <p className="text-lg font-medium">Theme</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={theme === "dark"} 
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
              <Label>
                Dark Mode
              </Label>
            </div>
          </section>
          <div>
            <p className="text-lg font-medium">Account</p>
            <p className="pt-2 text-sm text-muted-foreground">Username: {session?.user?.username ?? "N/A"}</p>
            <p className="pt-2 text-sm text-muted-foreground">Email: {session?.user?.email ?? "N/A"}</p>
            <Button variant="destructive" onClick={handleLogout} className="mt-2">
              <LogOut />
              Logout
            </Button>
          </div>
          <div>
            <p className="text-lg font-medium">App Version</p>
            <p className="pt-2 text-sm text-muted-foreground">Version: {packageJson.version}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
