import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function ProfileContent() {
  const cookieStore = await cookies();

  try {
    const response = await axios.get(`${process.env.APP_URL}/api/profile`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">My Profile</h1>

        <p className="mt-2 text-gray-600">
          View and manage your account information.
        </p>

        <ProfileForm profile={response.data} />
      </main>
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      redirect("/login");
    }

    throw error;
  }
}
