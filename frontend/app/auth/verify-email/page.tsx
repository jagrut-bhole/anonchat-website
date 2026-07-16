import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailClient from "./verify-email-client";

export const metadata: Metadata = {
  title: "Verify Email | AnonChat",
  description: "Verify your AnonChat account with the six digit OTP sent to your email.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailClient />
    </Suspense>
  );
}
