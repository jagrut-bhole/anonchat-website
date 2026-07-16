"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import AuthShell from "../_components/auth-shell";
import OTPInput from "@/components/otp-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkPasswordResetOtp, requestPasswordResetOtp } from "@/lib/auth-api";
import { PAGE_ROUTES } from "@/lib/route";

export default function ForgotPasswordClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpVisible, setOtpVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  async function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await requestPasswordResetOtp(email);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      setOtpVisible(true);
      toast.success("If the email exists, a reset OTP has been sent.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);

    try {
      const result = await checkPasswordResetOtp(email, otp);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("OTP verified. Set your new password.");
      router.push(`${PAGE_ROUTES.AUTH.RESET_PASSWORD}?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset password"
      description="Enter your email first. The OTP field appears after the reset code is sent."
      footer={{ text: "Remembered your password?", href: PAGE_ROUTES.AUTH.SIGN_IN, label: "Sign in" }}
    >
      {!otpVisible ? (
        <form onSubmit={requestOtp} className="space-y-5">
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

          <Button type="submit" disabled={loading} className="h-10 w-full bg-white text-zinc-950 hover:bg-zinc-200">
            {loading ? <Loader2 className="animate-spin" /> : <Mail />}
            Send OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-5">
          <div>
            <Label className="mb-3 block text-zinc-200">Enter OTP</Label>
            <OTPInput value={otp} onChange={setOtp} disabled={loading} autoFocus />
          </div>

          <Button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="h-10 w-full bg-white text-zinc-950 hover:bg-zinc-200"
          >
            {loading ? <Loader2 className="animate-spin" /> : <KeyRound />}
            Verify OTP
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => {
              setOtp("");
              setOtpVisible(false);
            }}
            className="w-full text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            Use a different email
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
