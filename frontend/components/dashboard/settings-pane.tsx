"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Bell,
  Volume2,
  Shield,
  LogOut,
  User,
  Check,
  Radio,
  Smartphone,
  Key,
} from "lucide-react";
import { SettingsRightPaneProps, UserPresenceStatus } from "@/types/dashboard";
import {
  SETTINGS_SECTION,
  USER_PRESENCE,
  PRESENCE_CONFIG,
} from "@/constants/dashboard";

export const SettingsPane: React.FC<SettingsRightPaneProps> = ({
  section,
  userPresence,
  onChangePresence,
  soundEnabled,
  onToggleSound,
  notificationsEnabled,
  onToggleNotifications,
  onSignOut,
  onGoToProfile,
  onBack,
  username,
  email,
  avatarUrl,
  avatarBgColor,
}) => {
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
            <h2 className="text-lg font-bold text-white">
              {section === SETTINGS_SECTION.PRESENCE && "Presence & Availability"}
              {section === SETTINGS_SECTION.NOTIFICATIONS && "Notifications & Sound"}
              {section === SETTINGS_SECTION.PRIVACY && "Privacy & Geofence Radius"}
              {section === SETTINGS_SECTION.SESSIONS && "Active Sessions & Security"}
              {section === SETTINGS_SECTION.ACCOUNT && "Account Information"}
            </h2>
            <p className="text-xs text-zinc-400">Manage your AnonChat client settings</p>
          </div>
        </div>

        {/* 1. PRESENCE SECTION */}
        {section === SETTINGS_SECTION.PRESENCE && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-zinc-400">
              Choose how your anonymous presence appears across all joined groups and friends list.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className={`flex items-center justify-between p-4 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-zinc-900 border-emerald-500 text-white shadow-md shadow-emerald-950/20"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`size-3 rounded-full ${config.color}`} />
                      <span>{config.label}</span>
                    </div>
                    {isSelected && <Check className="size-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. NOTIFICATIONS SECTION */}
        {section === SETTINGS_SECTION.NOTIFICATIONS && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col divide-y divide-zinc-800/80 rounded-2xl bg-zinc-900/80 border border-zinc-800 p-2">
              <div className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-3">
                  <Bell className="size-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">Message Notifications</p>
                    <p className="text-xs text-zinc-400">Show desktop alert badges when messages arrive</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => onToggleNotifications(e.target.checked)}
                  className="accent-emerald-500 size-5 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-3">
                  <Volume2 className="size-5 text-cyan-400" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">Incoming Audio Chimes</p>
                    <p className="text-xs text-zinc-400">Play subtle sound on incoming group chats</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => onToggleSound(e.target.checked)}
                  className="accent-emerald-500 size-5 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. PRIVACY SECTION */}
        {section === SETTINGS_SECTION.PRIVACY && (
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-emerald-400 font-bold text-sm">
                <Shield className="size-5" />
                <span>Zero-Knowledge Anonymity</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                AnonChat does not attach phone numbers, IP addresses, or real-life identity to your socket connections. All temporary message packets are encrypted in-transit.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-cyan-400 font-bold text-sm">
                <Radio className="size-5" />
                <span>Nearby Discovery Radius</span>
              </div>
              <p className="text-xs text-zinc-400">
                You can adjust your approximate matching radius anytime in your profile settings.
              </p>
            </div>
          </div>
        )}

        {/* 4. SESSIONS SECTION */}
        {section === SETTINGS_SECTION.SESSIONS && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="size-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-zinc-100">Current Web Session</p>
                  <p className="text-xs text-zinc-400">Next.js 16 Web Client • Active Now</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>
        )}

        {/* 5. ACCOUNT SECTION */}
        {section === SETTINGS_SECTION.ACCOUNT && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="size-12 rounded-2xl overflow-hidden flex items-center justify-center shadow-sm shrink-0"
                  style={{ backgroundColor: avatarBgColor || "#10b981" }}
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={username || "User"}
                      width={48}
                      height={48}
                      className="size-12 object-cover"
                      unoptimized
                    />
                  ) : (
                    <User className="size-6 text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-100 truncate">{username || "Anonymous"}</p>
                  <p className="text-xs text-zinc-400 truncate">{email || "Encrypted Account"}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onGoToProfile}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer shrink-0"
              >
                Edit Profile
              </button>
            </div>

            <button
              type="button"
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer mt-2"
            >
              <LogOut className="size-4" />
              <span>Sign Out of AnonChat</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
