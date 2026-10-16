import { requireRole } from "@/lib/require-auth";

export default async function HostDashboardPage() {
  const session = await requireRole(["HOST"]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Host Dashboard</h1>
      <p>Welcome, {session.user.name}!</p>
      <p>Manage your properties and reservations here.</p>
    </main>
  );
}
