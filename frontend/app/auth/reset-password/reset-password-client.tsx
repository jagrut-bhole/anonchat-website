"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthShell from "../_components/auth-shell";
import PasswordInput from "@/components/password-input-2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordWithOtp } from "@/lib/auth-api";
import { PAGE_ROUTES } from "@/lib/route";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const otp = searchParams.get("otp") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const matchMessage = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword ? "Passwords match" : "Passwords do not match";
  }, [confirmPassword, password]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !otp || password !== confirmPassword) return;
    setLoading(true);

    try {
      const result = await resetPasswordWithOtp(email, otp, password);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Password changed. Sign in with your new password.");
      router.push(PAGE_ROUTES.AUTH.SIGN_IN);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Choose new password" description="Enter and confirm your new password to finish the reset.">
      {!email || !otp ? (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-zinc-400">Your reset session is missing or expired.</p>
          <Button asChild className="w-full bg-white text-zinc-950 hover:bg-zinc-200">
            <Link href={PAGE_ROUTES.AUTH.FORGOT_PASSWORD}>Request a new OTP</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordInput
            id="new-password"
            label="New password"
            value={password}
            onChange={setPassword}
            required
            className="[&_label]:text-zinc-200 [&_input]:border-white/10 [&_input]:bg-zinc-950 [&_input]:text-white [&_input::placeholder]:text-zinc-500 [&_p]:text-zinc-400 [&_span]:text-zinc-400"
          />

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-zinc-200">
              Confirm password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              placeholder="Confirm password"
              className="h-10 border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500"
            />
            {matchMessage ? (
              <p className={password === confirmPassword ? "text-sm text-emerald-400" : "text-sm text-red-400"}>
                {matchMessage}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={loading || !password || password !== confirmPassword}
            className="h-10 w-full bg-white text-zinc-950 hover:bg-zinc-200"
          >
            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            Change password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
