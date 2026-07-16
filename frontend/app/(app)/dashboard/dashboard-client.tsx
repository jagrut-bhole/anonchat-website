"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, MessageCircle, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { AuthUser, getMe } from "@/lib/auth-api";
import { getPostAuthRoute, PAGE_ROUTES } from "@/lib/route";
import Image from "next/image";

export default function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    getMe().then((result) => {
      if (result.error || !result.data?.user) {
        router.replace(PAGE_ROUTES.AUTH.SIGN_IN);
        return;
      }

      const nextRoute = getPostAuthRoute(result.data.user);
      if (nextRoute !== PAGE_ROUTES.DASHBOARD) {
        router.replace(nextRoute);
        return;
      }

      setUser(result.data.user);
      setLoading(false);
    });
  }, [router]);

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    toast.success("Signed out");
    router.push(PAGE_ROUTES.AUTH.SIGN_IN);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="size-6 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/10 bg-zinc-900/70">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-white text-zinc-950">
              <MessageCircle size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">AnonChat</p>
              <p className="text-xs text-zinc-400">Dashboard</p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            disabled={signingOut}
            onClick={handleSignOut}
            className="text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            {signingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
            Sign out
          </Button>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 md:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border border-white/10 bg-zinc-900 p-5">
          <div className="flex items-center gap-4">
            {user?.image ? (
              <Image src={user.image} alt="" className="size-16 rounded-md bg-zinc-800" width={64} height={64} unoptimized/>
            ) : (
              <div className="flex size-16 items-center justify-center rounded-md bg-zinc-800">
                <UserRound />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium">{user?.username}</p>
              <p className="truncate text-sm text-zinc-400">{user?.email}</p>
            </div>
          </div>
        </aside>

        <section className="rounded-lg border border-white/10 bg-zinc-900 p-5">
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Your authentication flow is complete. Chat features can now be mounted here behind a verified session.
          </p>
        </section>
      </section>
    </main>
  );
}
