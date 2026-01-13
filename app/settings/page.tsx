"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LogOut, ArrowLeft, Shield, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item";

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
    }

    const isAdmin = session?.user?.role === "admin";

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen font-semibold">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <main className="min-h-screen p-4 md:p-6">
            <div className="flex items-center justify-between mb-8">      
                <Link href="/">
                    <ArrowLeft className="mb-3 h-6 w-6" />
                </Link>
                <p className="text-2xl font-semibold text-center">Settings</p>
                <div className="w-20"></div>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
                <section className="bg-card border rounded-lg p-6">
                    <p className="text-lg font-semibold mb-4">Theme</p>                                                                                                            
                    <div className="flex items-center justify-between">
                        <Label htmlFor="theme-toggle" className="text-sm text-muted-foreground">
                            Dark Mode
                        </Label>
                        <Switch 
                            id="theme-toggle"
                            checked={theme === "dark"} 
                            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                        /> 
                    </div>
                </section>
                <section className="space-y-4 rounded-lg border p-6">
                    <p className="text-lg font-medium">Account</p>
                    <div className="space-y-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Username</p>
                            <p>{session?.user?.username ?? "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p>{session?.user?.email ?? "N/A"}</p>
                        </div>
                    </div>
                    <Button variant="destructive" onClick={handleLogout} className="mt-2">
                        <LogOut className="h-5 w-5"/>
                        Logout
                    </Button>
                </section>
                {isAdmin ? (
                    <section className="space-y-2">
                        <Item variant="outline" size="sm" asChild>
                            <Link href="/admin" className="block">
                                <ItemMedia>
                                    <Shield className="size-5" />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Admin Dashboard</ItemTitle>
                                    <ItemDescription>Access admin dashboard and tools</ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <ChevronRightIcon className="size-4" />
                                </ItemActions>
                            </Link>
                        </Item>
                    </section>
                ) : (
                    <section className="space-y-2 rounded-lg border p-6">
                        <p className="text-lg font-medium mb-2">Admin Access</p>
                        <p className="text-sm text-muted-foreground mb-3">
                            Wanna be an Admin? Use this account
                        </p>
                        <Button 
                            variant="outline" 
                            className="w-full"
                            asChild
                        >
                            <a 
                                href="https://github.com/nizaralghifary/knot?tab=readme-ov-file#admin" 
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Shield className="h-4 w-4 mr-2" />
                                View Admin Account Details
                            </a>
                        </Button>
                    </section>
                )}
                <section className="space-y-2 rounded-lg border p-6">
                    <p className="text-lg font-medium">App Version</p>
                    <p className="pt-2 text-sm text-muted-foreground">Version: {packageJson.version}</p>
                </section>
            </div>
        </main>
    );
    
}