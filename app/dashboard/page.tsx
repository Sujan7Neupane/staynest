import { requireAuth } from "@/lib/require-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await requireAuth();

  if (session.user.role === "GUEST") {
    redirect("/dashboard/guest");
  }

  if (session.user.role === "HOST") {
    redirect("/dashboard/host");
  }

  if (session.user.role === "ADMIN") {
    redirect("/dashboard/admin");
  }
}
