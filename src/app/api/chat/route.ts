import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const { message, ownerId } = body;

        if (!message || !ownerId) {
            return NextResponse.json(
                { reply: "Message and ownerId are required." },
                { status: 400, headers: corsHeaders }
            );
        }

        await connectDb();
        const setting = await Settings.findOne({ ownerId });

        if (!setting) {
            return NextResponse.json(
                { reply: "Chatbot is not configured yet. Please configure your settings in the dashboard." },
                { status: 400, headers: corsHeaders }
            );
        }

        const businessName = setting.businessName || "our business";
        const supportEmail = setting.supportEmail || "support team";
        const knowledge = setting.knowledge || "No additional information provided.";

        const systemPrompt = `You are a professional customer support assistant for "${businessName}".

KNOWLEDGE BASE:
${knowledge}

RULES:
1. Answer ONLY using information from the knowledge base above.
2. If the user's question cannot be answered using the provided knowledge base, politely say that you do not know the answer and tell the user to contact support at ${supportEmail}.
3. Do NOT invent new policies, prices, promises, or facts not explicitly stated in the knowledge base.
4. Keep answers concise, polite, and helpful.`;

        console.log("POST /api/chat - Incoming request:", { ownerId, message });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not defined in environment variables.");
            return NextResponse.json(
                { reply: "Something went wrong" },
                { status: 500, headers: corsHeaders }
            );
        }

        const ai = new GoogleGenAI({ apiKey });

        let replyText = "";
        const candidateModels = ["gemini-3.6-flash", "gemini-3.8-flash", "gemini-2.5-flash"];
        for (const model of candidateModels) {
            try {
                const res = await ai.models.generateContent({
                    model,
                    contents: message,
                    config: {
                        systemInstruction: systemPrompt,
                    },
                });
                if (res.text) {
                    replyText = res.text;
                    break;
                }
            } catch (err: any) {
                console.error(`Gemini model ${model} failed, trying next:`, err?.message || err);
            }
        }

        if (!replyText || typeof replyText !== "string") {
            replyText = `I apologize, but I am unable to answer right now. Please reach out to our support team at ${supportEmail}.`;
        }

        console.log("POST /api/chat - Generated reply:", replyText);

        return NextResponse.json(
            { reply: String(replyText) },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error("Error in /api/chat:", error);
        return NextResponse.json(
            { reply: "Something went wrong" },
            { status: 500, headers: corsHeaders }
        );
    }
}