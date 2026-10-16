import { requireRole } from "@/lib/require-auth";

export default async function GuestDashboardPage() {
  const session = await requireRole(["GUEST"]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Guest Dashboard</h1>
      <p>Welcome, {session.user.name}!</p>
      <p>Browse stays and manage your bookings here.</p>
    </main>
  );
}
