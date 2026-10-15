import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/getSession";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Explicitly public routes: never run auth checks on these
    if (
        pathname === "/chatBot.js" ||
        pathname === "/test.html" ||
        pathname.startsWith("/api/chat") ||
        pathname.startsWith("/api/settings/get")
    ) {
        return NextResponse.next();
    }

    // Only /dashboard and /embed require login
    const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/embed");
    if (!isProtected) {
        return NextResponse.next();
    }

    try {
        const session = await getSession();
        if (!session) {
            const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || new URL("/", req.url).toString();
            const response = NextResponse.redirect(redirectUrl);
            response.cookies.delete("access_token");
            return response;
        }
    } catch (error: any) {
        console.error("Auth proxy token validation error:", error?.message || error);
        const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || new URL("/", req.url).toString();
        const response = NextResponse.redirect(redirectUrl);
        response.cookies.delete("access_token");
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/embed/:path*"],
};
