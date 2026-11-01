import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordClient from "./reset-password-client";

export const metadata: Metadata = {
  title: "Reset Password | AnonChat",
  description: "Set a new password for your AnonChat account after OTP verification.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordClient />
    </Suspense>
  );
}
