"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboarding, getMe } from "@/lib/auth-api";
import { authClient } from "@/lib/auth-client";
import { PAGE_ROUTES } from "@/lib/route";
import { cn } from "@/lib/utils";

const AVATARS = [
  "https://api.dicebear.com/9.x/thumbs/svg?seed=anon-ember&backgroundColor=f97316",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=anon-mint&backgroundColor=10b981",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=anon-sky&backgroundColor=0ea5e9",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=anon-rose&backgroundColor=f43f5e",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=anon-amber&backgroundColor=f59e0b",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=anon-violet&backgroundColor=8b5cf6",
];

export default function OnboardingClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    getMe().then((result) => {
      if (result.error || !result.data?.user.emailVerified) {
        router.replace(PAGE_ROUTES.AUTH.SIGN_IN);
        return;
      }

      setUsername(result.data.user.username || "");
      setAvatar(result.data.user.image || AVATARS[0]);
      setInitializing(false);
    });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await completeOnboarding({
        username: username.trim(),
        image: avatar,
      });

      if (result.error) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      // Sync the better-auth cache so the middleware gets the updated user
      await authClient.updateUser({
        image: avatar,
        username: username.trim(),
        name: username.trim()
      });

      toast.success("Profile completed");
      window.location.href = PAGE_ROUTES.DASHBOARD;
    } catch (error) {
      toast.error("Failed to complete onboarding");
      console.log("Error at onboarding page: ", error);
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="size-6 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-xl rounded-lg border border-white/10 bg-zinc-900 p-6">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-zinc-400">AnonChat</p>
          <h1 className="text-2xl font-semibold">Complete your profile</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Choose how you will appear before entering the dashboard.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-zinc-200">Profile picture</Label>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {AVATARS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAvatar(option)}
                  className={cn(
                    "relative aspect-square rounded-md border border-white/10 bg-zinc-950 p-2 transition hover:border-white/40",
                    avatar === option && "border-white"
                  )}
                  aria-label="Select avatar"
                >
                  <span
                    aria-hidden="true"
                    className="block h-full w-full rounded-md bg-cover bg-center"
                    style={{ backgroundImage: `url(${option})` }}
                  />
                  {avatar === option ? (
                    <span className="absolute right-1 top-1 rounded-full bg-white p-1 text-zinc-950">
                      <Check size={12} />
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-zinc-200">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              minLength={3}
              maxLength={30}
              pattern="[A-Za-z0-9_]+"
              placeholder="anon_user"
              className="h-10 border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500"
            />
            <p className="text-xs text-zinc-500">Use 3-30 letters, numbers, or underscores.</p>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="mt-8 h-10 w-full bg-white text-zinc-950 hover:bg-zinc-200">
          {loading ? <Loader2 className="animate-spin" /> : <Check />}
          Continue to dashboard
        </Button>
      </form>
    </main>
  );
}
