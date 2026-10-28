import { Suspense } from "react";
import ProfileContent from "../../components/client/ProfileContent";

export default function ProfilePage() {
  return (
    <Suspense fallback={<p className="p-8">Loading profile...</p>}>
      <ProfileContent />
    </Suspense>
  );
}
