import type { Metadata } from "next";
import SignInClient from "./sign-in-client";

export const metadata: Metadata = {
  title: "Sign In | AnonChat",
  description: "Sign in to your AnonChat account with email and password.",
};

export default function SignInPage() {
  return <SignInClient />;
}
