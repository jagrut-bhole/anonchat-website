import type { Metadata } from "next";
import DashboardClient from "./dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard | AnonChat",
  description: "Anonymous encrypted chats, group rooms, and real-time connections.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
