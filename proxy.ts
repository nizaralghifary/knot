import { NextResponse } from "next/server";
import type { NextRequest, ProxyConfig } from "next/server";
import { auth } from "@/auth";

export async function proxy(request: NextRequest) {
    const response = NextResponse.next();

    const corsResponse = handleCORS(response, request);
    if (corsResponse) return corsResponse;

    const { pathname } = request.nextUrl;
    const session = await auth();

    if (
        pathname.startsWith("_next") ||
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up") ||
        pathname.startsWith("/sign-out") ||
        pathname.startsWith("/verify") ||
        pathname.startsWith("/verify/otp") ||
        pathname.startsWith("/terms") ||
        pathname.startsWith("/privacy") ||
        pathname.startsWith("/api/auth") 
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
};

function handleCORS(response: NextResponse, request: NextRequest) {
    const origin = "https://knot.nizar.my.id";

    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");

    if (request.method === "OPTIONS") {
        return new NextResponse(null, {
            headers: response.headers,
            status: 204,
        });
    }
}

export const config: ProxyConfig = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
        "/api/:path((?!auth).*)"
    ],
};