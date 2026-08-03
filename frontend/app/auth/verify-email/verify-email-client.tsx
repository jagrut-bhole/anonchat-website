"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MailCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import AuthShell from "../_components/auth-shell";
import OTPInput from "@/components/otp-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendEmailVerificationOtp, verifyEmailOtp } from "@/lib/auth-api";
import { PAGE_ROUTES } from "@/lib/route";

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);

    try {
      const result = await verifyEmailOtp(email, otp);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Email verified");
      // After email verification, user needs to complete onboarding
      router.push(PAGE_ROUTES.ONBOARDING);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setResending(true);

    try {
      const result = await sendEmailVerificationOtp(email);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Verification OTP sent");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell
      title="Verify email"
      description="Enter the six digit OTP sent to your email address."
      footer={{ text: "Already verified?", href: PAGE_ROUTES.AUTH.SIGN_IN, label: "Sign in" }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-200">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="you@example.com"
            className="h-10 border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500"
          />
        </div>

        <div>
          <Label className="mb-3 block text-zinc-200">OTP</Label>
          <OTPInput value={otp} onChange={setOtp} disabled={loading} autoFocus={Boolean(email)} className="text-black"/>
        </div>

        <Button
          type="submit"
          disabled={loading || !email || otp.length !== 6}
          className="h-10 w-full bg-white text-zinc-950 hover:bg-zinc-200"
        >
          {loading ? <Loader2 className="animate-spin" /> : <MailCheck />}
          Verify email
        </Button>

        <Button
          type="button"
          variant="ghost"
          disabled={resending || !email}
          onClick={resendOtp}
          className="w-full text-zinc-300 hover:bg-white/10 hover:text-white"
        >
          {resending ? <Loader2 className="animate-spin" /> : <RotateCcw />}
          Resend OTP
        </Button>
      </form>
    </AuthShell>
  );
}
