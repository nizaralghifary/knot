import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      is_verified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    is_verified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string;
    is_verified: boolean;
  }
}