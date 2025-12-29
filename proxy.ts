import { NextResponse } from "next/server";
import type { NextRequest, ProxyConfig } from "next/server";
import { auth } from "@/auth";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = await auth();

    if (
        pathname.startsWith("_next") ||
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up") ||
        pathname.startsWith("/sign-out") ||
        pathname.startsWith("/api/auth") ||
        pathname === "favicon.ico" ||
        pathname === ""
    ) {
        return NextResponse.next();
    }

    if (!session) {
        return NextResponse.redirect(
            new URL("/sign-in", request.url)
        );
    }

    if (pathname.startsWith("/admin")) {
        if (session?.user.role !== "admin") {
            return NextResponse.redirect(
                new URL("/", request.url)
            );
        }
    }
}

export const config: ProxyConfig = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};