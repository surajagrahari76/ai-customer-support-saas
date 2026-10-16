import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { ownerId } = await req.json();
        if (!ownerId) {
            return NextResponse.json(
                { message: "owner id is required" },
                { status: 400 }
            );
        }
        const setting = await prisma.settings.findUnique({
            where: { ownerId },
        });
        return NextResponse.json(setting);
    } catch (error) {
        console.error("get setting error:", error);
        return NextResponse.json(
            { message: `get setting error ${error}` },
            { status: 500 }
        );
    }
}