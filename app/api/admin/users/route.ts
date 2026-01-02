import { auth } from "@/auth";
import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { eq, desc, ilike, or, sql } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session || session?.user?.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role") || "";

        const offset = (page - 1) * limit;

        let whereConditions = [];
        
        if (search) {
            whereConditions.push(
                or(
                    ilike(users.username, `%${search}%`),
                    ilike(users.email, `%${search}%`)
                )
            );
        }

        if (role && role !== "all") {
            whereConditions.push(eq(users.role, role as "admin" | "user"));
        }

        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(whereConditions.length > 0 ? sql`${sql.join(whereConditions, sql` AND `)}` : undefined);

        const total = Number(totalResult[0]?.count || 0);

        const usersList = await db
            .select({
                id: users.id,
                username: users.username,
                email: users.email,
                role: users.role,
                is_verified: users.is_verified,
                created_at: users.created_at,
            })
            .from(users)
            .where(whereConditions.length > 0 ? sql`${sql.join(whereConditions, sql` AND `)}` : undefined)
            .orderBy(desc(users.created_at))
            .limit(limit)
            .offset(offset);

        return NextResponse.json({
            users: usersList,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("id");

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        if (userId === session.user.id) {
            return NextResponse.json(
                { error: "Cannot delete your own account" },
                { status: 400 }
            );
        }

        await db.delete(users).where(eq(users.id, userId));

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        );
    }
}