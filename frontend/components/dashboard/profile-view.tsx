"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  Shield,
  LogOut,
  Mail,
  Sparkles,
  Check,
} from "lucide-react";
import { ProfileViewProps, UserPresenceStatus } from "@/types/dashboard";
import { USER_PRESENCE, PRESENCE_CONFIG } from "@/constants/dashboard";
import buildPreviewUrl from "@/utils/onboardingFunc";

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onBack,
  onSignOut,
  userPresence,
  onChangePresence,
}) => {
  const avatarUrl =
    user.avatarStyle && user.avatarSeed
      ? buildPreviewUrl(
          user.avatarStyle,
          user.avatarSeed,
          user.avatarBackgroundColor || undefined
        )
      : null;

  return (
    <section className="flex-1 flex flex-col h-full bg-zinc-950/70 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-zinc-800 select-none">
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
        {/* Header with Back button */}
        <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Back to Groups"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">Your Profile & Persona</h2>
            <p className="text-xs text-zinc-400">Manage your anonymous identity in AnonChat</p>
          </div>
        </div>

        {/* Avatar & Pseudonym Card */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col items-center justify-center gap-4 text-center shadow-lg">
          <div className="relative">
            <div
              className="size-24 rounded-3xl overflow-hidden shadow-xl ring-2 ring-zinc-700 flex items-center justify-center"
              style={{ backgroundColor: user.avatarBackgroundColor || "#10b981" }}
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={user.username || "Avatar"}
                  width={96}
                  height={96}
                  className="size-24 object-cover"
                  unoptimized
                />
              ) : (
                <User className="size-12 text-white" />
              )}
            </div>

            {/* Status dot */}
            <span
              className={`absolute -bottom-1 -right-1 size-5 rounded-full ring-4 ring-zinc-900 ${
                PRESENCE_CONFIG[userPresence].color
              }`}
            />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">{user.username || "Anonymous"}</h3>
            <p className="text-xs text-emerald-400 font-medium mt-0.5">
              Verified Anonymous Persona
            </p>
          </div>
        </div>

        {/* Presence Status Quick Switcher */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col gap-3">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Presence Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                USER_PRESENCE.ONLINE,
                USER_PRESENCE.AWAY,
                USER_PRESENCE.BUSY,
                USER_PRESENCE.OFFLINE,
              ] as UserPresenceStatus[]
            ).map((status) => {
              const config = PRESENCE_CONFIG[status];
              const isSelected = userPresence === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onChangePresence(status)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-zinc-850 border-emerald-500 text-white"
                      : "bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`size-2.5 rounded-full ${config.color}`} />
                    <span>{config.label}</span>
                  </div>
                  {isSelected && <Check className="size-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Account Info Details */}
        <div className="flex flex-col divide-y divide-zinc-800/80 rounded-2xl bg-zinc-900/60 border border-zinc-800 p-2">
          <div className="flex items-center justify-between p-3.5 text-xs">
            <div className="flex items-center gap-3 text-zinc-400">
              <Mail className="size-4 text-emerald-400" />
              <span>Email Address</span>
            </div>
            <span className="font-semibold text-zinc-200">{user.email || "Encrypted"}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 text-xs">
            <div className="flex items-center gap-3 text-zinc-400">
              <Sparkles className="size-4 text-purple-400" />
              <span>Avatar Style</span>
            </div>
            <span className="font-semibold text-zinc-200 uppercase">
              {user.avatarStyle || "Persona"}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 text-xs">
            <div className="flex items-center gap-3 text-zinc-400">
              <Shield className="size-4 text-cyan-400" />
              <span>Privacy Shield</span>
            </div>
            <span className="font-semibold text-emerald-400">Active</span>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
        >
          <LogOut className="size-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </section>
  );
};
