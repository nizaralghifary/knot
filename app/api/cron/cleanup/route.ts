import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { lt, eq, and } from "drizzle-orm";

export async function GET() {
    await db.delete(users).where(
        and(
            eq(users.is_verified, false),
            lt(users.created_at, new Date(Date.now() - 24 * 60 * 60 * 1000))
        )
    );

    return NextResponse.json({ ok: true });
}