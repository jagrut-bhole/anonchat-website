"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import AuthShell from "../_components/auth-shell";
import PasswordInput from "@/components/password-input-2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { PAGE_ROUTES } from "@/lib/route";

export default function SignUpClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: "Anonymous" // Name will be updated later during onboarding
      });

      if (error) {
        toast.error(error.message || "Unable to create account");
        return;
      }

      toast.success("Account created. Check your email for the OTP.");
      router.push(`${PAGE_ROUTES.AUTH.VERIFY_EMAIL}?email=${encodeURIComponent(email)}&next=${encodeURIComponent(PAGE_ROUTES.ONBOARDING)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create account"
      description="Create your account first. You will choose your username and profile picture after email verification."
      footer={{ text: "Already have an account?", href: PAGE_ROUTES.AUTH.SIGN_IN, label: "Sign in" }}
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
          className="[&_label]:text-zinc-200 [&_input]:border-white/10 [&_input]:bg-zinc-950 [&_input]:text-white [&_input::placeholder]:text-zinc-500 [&_p]:text-zinc-400 [&_span]:text-zinc-400"
        />

        <Button type="submit" disabled={loading} className="h-10 w-full bg-white text-zinc-950 hover:bg-zinc-200">
          {loading ? <Loader2 className="animate-spin" /> : <UserPlus />}
          Sign up
        </Button>
      </form>
    </AuthShell>
  );
}
