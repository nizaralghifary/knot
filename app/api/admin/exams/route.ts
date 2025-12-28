import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db/drizzle";
import { exams, questions } from "@/lib/db/schema";
import { z } from "zod";

const examSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    duration: z.number().min(1, "Duration must be at least 1 minute"),
    is_published: z.boolean().default(false),
})

const questionSchema = z.object({
    question_text: z.string().min(1, "Question text is required"),
    question_type: z.enum(["multiple_choice", "short_answer", "matching"]),
    options: z.array(z.string()).optional(),
    correct_answer: z.union([z.string(), z.array(z.string())]),
    points: z.number().min(1, "Points must be at least 1"),
    order: z.number().min(1),
})

/*export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }
    }
}*/
