import "next-auth";
import "next-auth/jwt";

type UserRole = "GUEST" | "HOST" | "ADMIN";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
  }
}
