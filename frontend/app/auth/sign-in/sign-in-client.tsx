"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import AuthShell from "../_components/auth-shell";
import { authClient } from "@/lib/auth-client";
import { getMe, sendEmailVerificationOtp, checkOnboardingStatus } from "@/lib/auth-api";
import { getPostAuthRoute, PAGE_ROUTES } from "@/lib/route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/password-input-2";

function isEmailNotVerified(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error ? String(error.message) : "";
  const code = "code" in error ? String(error.code) : "";
  return code === "EMAIL_NOT_VERIFIED" || message.toLowerCase().includes("email") && message.toLowerCase().includes("verified");
}

export default function SignInClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({ email, password });

      if (error) {
        if (isEmailNotVerified(error)) {
          await sendEmailVerificationOtp(email);
          toast.info("Verify your email to continue.");
          router.push(`${PAGE_ROUTES.AUTH.VERIFY_EMAIL}?email=${encodeURIComponent(email)}&next=${encodeURIComponent(PAGE_ROUTES.DASHBOARD)}`);
          return;
        }

        toast.error(error.message || "Unable to sign in");
        return;
      }

      const [profile, onboardingResult] = await Promise.all([
        getMe(),
        checkOnboardingStatus(),
      ]);
      toast.success("Signed in successfully");
      const userWithOnboarding = {
        ...profile.data?.user,
        onboardingCompleted: onboardingResult.data?.onboardingCompleted ?? false,
      };
      router.push(getPostAuthRoute(userWithOnboarding));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Sign in"
      description="Enter your email and password to continue to your account."
      footer={{ text: "Do not have an account?", href: PAGE_ROUTES.AUTH.SIGN_UP, label: "Sign up" }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-200">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="you@example.com"
            className="h-10 border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500"
          />
        </div>

        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          required
          showRequirements={false}
          className="[&_label]:text-zinc-200 [&_input]:border-white/10 [&_input]:bg-zinc-950 [&_input]:text-white [&_input::placeholder]:text-zinc-500"
        />

        <div className="flex justify-end">
          <Link href={PAGE_ROUTES.AUTH.FORGOT_PASSWORD} className="text-sm text-zinc-300 hover:text-white">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" disabled={loading} className="h-10 w-full bg-white text-zinc-950 hover:bg-zinc-200">
          {loading ? <Loader2 className="animate-spin" /> : <LogIn />}
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
