import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { ownerId, businessName, supportEmail, knowledge } = await req.json();
        if (!ownerId) {
            return NextResponse.json(
                { message: "owner id is required" },
                { status: 400 }
            );
        }
        const settings = await prisma.settings.upsert({
            where: { ownerId },
            update: {
                businessName: businessName ?? "",
                supportEmail: supportEmail ?? "",
                knowledge: knowledge ?? "",
            },
            create: {
                ownerId,
                businessName: businessName ?? "",
                supportEmail: supportEmail ?? "",
                knowledge: knowledge ?? "",
            },
        });
        return NextResponse.json(settings);
    } catch (error) {
        console.error("settings error:", error);
        return NextResponse.json(
            { message: `settings error ${error}` },
            { status: 500 }
        );
    }
}



