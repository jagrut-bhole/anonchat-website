"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Loader2,
  LogOut,
  Shield,
  Mail,
  Calendar,
  Monitor,
  Smartphone,
  Globe,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  User,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  getUserProfile,
  getActiveSessions,
  revokeSession,
  type UserProfile,
  type SessionInfo,
} from "@/lib/auth-api";
import { PAGE_ROUTES } from "@/lib/route";

// ─── Helpers ────────────────────────────────────────────────

const DICEBEAR_BASE = "https://api.dicebear.com/10.x";

function buildAvatarUrl(style: string, seed: string, bgColor?: string) {
  const base = `${DICEBEAR_BASE}/${style}/svg?seed=${encodeURIComponent(seed)}`;
  if (bgColor) {
    return `${base}&backgroundColor=${bgColor.replace(/^#/, "")}`;
  }
  return base;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseUserAgent(ua: string | null): {
  device: string;
  browser: string;
  icon: typeof Monitor;
} {
  if (!ua)
    return {
      device: "Unknown device",
      browser: "Unknown browser",
      icon: Globe,
    };

  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  const icon = isMobile ? Smartphone : Monitor;

  let browser = "Unknown browser";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";

  let os = "Unknown OS";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux") && !ua.includes("Android")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return { device: os, browser, icon };
}

// ─── Component ──────────────────────────────────────────────

export default function ProfileClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [profileResult, sessionsResult] = await Promise.all([
        getUserProfile(),
        getActiveSessions(),
      ]);

      if (profileResult.error || !profileResult.data) {
        router.replace(PAGE_ROUTES.AUTH.SIGN_IN);
        return;
      }

      setProfile(profileResult.data);
      if (sessionsResult.data) {
        setSessions(sessionsResult.data.sessions);
      }
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    toast.success("Signed out");
    router.push(PAGE_ROUTES.AUTH.SIGN_IN);
    router.refresh();
  }

  async function handleRevokeSession(sessionId: string) {
    setRevokingId(sessionId);
    const result = await revokeSession(sessionId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Session revoked");
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    }
    setRevokingId(null);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="size-6 animate-spin" />
      </main>
    );
  }

  const avatarUrl =
    profile?.avatarStyle && profile?.avatarSeed
      ? buildAvatarUrl(
          profile.avatarStyle,
          profile.avatarSeed,
          profile.avatarBackgroundColor || undefined,
        )
      : null;

  const onboardingCompleted =
    profile?.accounts?.[0]?.onboardingCompleted ?? false;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-zinc-900/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(PAGE_ROUTES.DASHBOARD)}
              className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <p className="text-sm font-semibold">AnonChat</p>
              <p className="text-xs text-zinc-400">Profile</p>
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
      <div className="flex justify-center text-center">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push(PAGE_ROUTES.DASHBOARD)}
            className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <p>Dashboard</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {/* Account Details Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-white/10 bg-zinc-900 p-6"
        >
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
            <User className="size-5 text-violet-400" />
            Account Details
          </h2>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              {avatarUrl ? (
                <div
                  className="overflow-hidden rounded-xl shadow-lg transition-colors duration-300"
                  style={{
                    backgroundColor:
                      profile?.avatarBackgroundColor || "#007AFF",
                  }}
                >
                  <Image
                    src={avatarUrl}
                    alt="Your avatar"
                    className="size-28"
                    width={112}
                    height={112}
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex size-28 items-center justify-center rounded-xl bg-zinc-800">
                  <User className="size-10 text-zinc-500" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                  Username
                </p>
                <p className="mt-1 text-lg font-medium">
                  {profile?.username || "Not set"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Mail className="size-3" /> Email
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">{profile?.email}</p>
                </div>

                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="size-3" /> Member Since
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">
                    {profile?.createdAt
                      ? formatDate(profile.createdAt)
                      : "Unknown"}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </motion.section>

        {/* Active Sessions Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl border border-white/10 bg-zinc-900 p-6"
        >
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
            <Shield className="size-5 text-violet-400" />
            Active Sessions
          </h2>

          {sessions.length === 0 ? (
            <p className="text-sm text-zinc-500">No active sessions found.</p>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {sessions.map((session) => {
                  const {
                    device,
                    browser,
                    icon: DeviceIcon,
                  } = parseUserAgent(session.userAgent);
                  const isRevoking = revokingId === session.id;

                  return (
                    <motion.div
                      key={session.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                        session.isCurrent
                          ? "border-violet-500/30 bg-violet-500/5"
                          : "border-white/5 bg-zinc-800/50 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex size-10 items-center justify-center rounded-lg ${
                            session.isCurrent
                              ? "bg-violet-500/20 text-violet-400"
                              : "bg-zinc-700 text-zinc-400"
                          }`}
                        >
                          <DeviceIcon className="size-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {browser} on {device}
                            </p>
                            {session.isCurrent && (
                              <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            Created: {formatDateTime(session.createdAt)}
                            {session.ipAddress && ` · IP: ${session.ipAddress}`}
                          </p>
                        </div>
                      </div>

                      {!session.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isRevoking}
                          onClick={() => handleRevokeSession(session.id)}
                          className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                          {isRevoking ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                          Sign Out
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.section>
      </div>
    </main>
  );
}
