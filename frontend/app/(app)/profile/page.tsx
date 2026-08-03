import ProfileClient from "./profile-client";

export const metadata = {
  title: "Profile — AnonChat",
  description: "View your account details and manage active sessions.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
