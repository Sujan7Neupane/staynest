import { auth } from "@/auth";
import { redirect } from "next/navigation";

// reusable compoonent -> no repeat same authentication check on every protected page
type UserRole = "GUEST" | "HOST" | "ADMIN";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized");
  }

  return session;
}
