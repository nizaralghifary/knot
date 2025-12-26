import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      is_verified: boolean;
      role: "admin"|"user";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    email: string;
    is_verified: boolean;
    role: "admin"|"user";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    email: string;
    is_verified: boolean;
    role: "admin"|"user";
  }
}