import type { Metadata } from "next";
import OnboardingClient from "./onboarding-client";

export const metadata: Metadata = {
  title: "Onboarding | AnonChat",
  description: "Choose your AnonChat username and profile picture.",
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
