import type { Metadata } from "next";
import SignUpClient from "./sign-up-client";

export const metadata: Metadata = {
  title: "Sign Up | AnonChat",
  description: "Create an AnonChat account and verify your email with a six digit OTP.",
};

export default function SignUpPage() {
  return <SignUpClient />;
}
