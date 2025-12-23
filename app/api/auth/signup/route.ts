import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const SECRET_KEY = process.env.MATHRIX_TOKEN;

export async function POST(request: Request) {
  try {
    const tokenKey = request.headers.get("Authorization")?.split(" ")[1];

    if (!tokenKey || tokenKey !== SECRET_KEY) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid token key" },
        { status: 401 }
      );
    }

    const { username, email, password } = await request.json();

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { message: "Invalid username format!" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format!" },
        { status: 400 }
      );
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { message: "Invalid password format!" },
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
      { message: "Account successfully created." },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}