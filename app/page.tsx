import LogoutButton from "./components/LogoutButton";
import UserSession from "./components/UserSession";

export default function Home() {
  return (
    <main className="p-6">
      <h1>HomePage</h1>
      <UserSession />

      <LogoutButton />
    </main>
  );
}
