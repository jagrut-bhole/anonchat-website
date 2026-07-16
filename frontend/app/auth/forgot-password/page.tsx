import type { Metadata } from "next";
import ForgotPasswordClient from "./forgot-password-client";

export const metadata: Metadata = {
  title: "Forgot Password | AnonChat",
  description: "Request a password reset OTP for your AnonChat account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
