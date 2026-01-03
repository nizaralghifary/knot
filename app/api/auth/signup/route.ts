import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { and, gte, lte } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const todayUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          gte(users.created_at, startOfDay),
          lte(users.created_at, endOfDay)
        )
    );

    if (todayUsers.length >= 5) {
      return NextResponse.json(
        { message: "Daily signup limit reached. Try again tomorrow" },
        { status: 429 }
      );
    }

    const { username, email, password } = await request.json();

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { message: "Username must be 3–20 characters long and can only contain letters, numbers, and underscores (_)!" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address (e.g. name@example.com)!" },
        { status: 400 }
      );
    }

    const passwordRegex = /^(?=.*[a-zA-Z])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long and include at least one letter!" },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "Email already exists!" },
        { status: 409 }
      );
    }

    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (existingUsername.length > 0) {
      return NextResponse.json(
        { message: "Username already exists!" },
        { status: 409 }
      );
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "Account successfully created" },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}