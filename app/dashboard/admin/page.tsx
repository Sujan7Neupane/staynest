import { requireRole } from "@/lib/require-auth";

export default async function AdminDashboardPage() {
  const session = await requireRole(["ADMIN"]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p>Welcome, {session.user.name}!</p>
      <p>Manage users and the platform here.</p>
    </main>
  );
}
