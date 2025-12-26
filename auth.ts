import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { db } from "@/lib/db/drizzle";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";

type DatabaseUser = {
  id: string;
  username: string;
  email: string;
  password: string;
  is_verified: boolean;
  role: "admin"|"user";
};

const SESSION_MAX_AGE = 1*24*60*60;

const getUserByUsername = async (username: string): Promise<DatabaseUser | null> => {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Database error while fetching user:", error);
    return null;
  }
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Credentials are required!");
        }

        const { username, password } = credentials as {
          username: string;
          password: string;
        };

        if (!username || !password) {
          throw new Error("Username and password are required!");
        }

        const user = await getUserByUsername(username);
        if (!user) {
          throw new Error("User not found!");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid password!");
        }

        if (!user.is_verified) {
          throw new Error("Your account is not verified. Please verify via OTP.");
        }

        return { 
          id: user.id, 
          username: user.username,
          email: user.email,
          is_verified: user.is_verified,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE },
  jwt: { maxAge: SESSION_MAX_AGE },
  pages: { 
    signIn: "/sign-in", 
    signOut: "/sign-out" 
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.is_verified = token.is_verified;
        session.user.role = token.role;
      }
    return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.username = user.username;
        token.email = user.email as string;
        token.is_verified = user.is_verified;
        token.role = user.role;
      }
    return token;
    },
  },
  secret: process.env.AUTH_SECRET,
});