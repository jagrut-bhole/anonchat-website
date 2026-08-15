"use client";

import React from "react";
import Image from "next/image";
import {
  Users,
  UserCheck,
  Compass,
  Radio,
  Settings,
  User,
} from "lucide-react";
import { NavRailProps } from "@/types/dashboard";
import { NAV_TAB, PRESENCE_CONFIG } from "@/constants/dashboard";
import maskLogo from "@/public/images/mask.png";

export const NavRail: React.FC<NavRailProps> = ({
  activeTab,
  onSelectTab,
  unreadChatCount,
  pendingFriendsCount,
  userAvatarUrl,
  userAvatarBg,
  userPresence,
  username,
}) => {
  const presenceStyle = PRESENCE_CONFIG[userPresence] || PRESENCE_CONFIG.online;

  return (
    <nav
      aria-label="Main Navigation Rail"
      className="w-16 md:w-18 bg-zinc-950/95 border-r border-zinc-800/80 flex flex-col items-center justify-between py-4 select-none shrink-0 z-30 backdrop-blur-md"
    >
      {/* Top Section: Logo + Main Navigation Tabs */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* AnonChat Mask Brand Logo (Directly shown, enlarged, no circle frame) */}
        <button
          type="button"
          onClick={() => onSelectTab(NAV_TAB.GROUPS)}
          className="group relative flex items-center justify-center p-1 hover:scale-105 transition-transform duration-200 cursor-pointer"
          title="AnonChat Groups"
        >
          <Image
            src={maskLogo}
            alt="AnonChat Logo"
            width={38}
            height={38}
            className="size-9.5 md:size-10 object-contain drop-shadow-md"
          />
        </button>

        {/* Navigation Tabs (Groups, Friends, Find Groups, Live Search) */}
        <div className="flex flex-col items-center gap-2 w-full px-2">
          {/* 1. Groups */}
          <button
            type="button"
            onClick={() => onSelectTab(NAV_TAB.GROUPS)}
            className={`group relative flex items-center justify-center size-12 rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === NAV_TAB.GROUPS
                ? "bg-emerald-500/15 text-emerald-400 font-semibold shadow-inner"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80"
            }`}
            title="Joined Groups"
          >
            {activeTab === NAV_TAB.GROUPS && (
              <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-emerald-500 rounded-r-full shadow-sm shadow-emerald-500" />
            )}
            <Users className="size-5 transition-transform group-hover:scale-110" />
            {unreadChatCount > 0 && (
              <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-zinc-950 ring-2 ring-zinc-950">
                {unreadChatCount > 9 ? "9+" : unreadChatCount}
              </span>
            )}
            <span className="sr-only">Groups</span>
          </button>

          {/* 2. Friends */}
          <button
            type="button"
            onClick={() => onSelectTab(NAV_TAB.FRIENDS)}
            className={`group relative flex items-center justify-center size-12 rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === NAV_TAB.FRIENDS
                ? "bg-emerald-500/15 text-emerald-400 font-semibold shadow-inner"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80"
            }`}
            title="Friends & Connects"
          >
            {activeTab === NAV_TAB.FRIENDS && (
              <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-emerald-500 rounded-r-full shadow-sm shadow-emerald-500" />
            )}
            <UserCheck className="size-5 transition-transform group-hover:scale-110" />
            {pendingFriendsCount > 0 && (
              <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-zinc-950 ring-2 ring-zinc-950">
                {pendingFriendsCount > 9 ? "9+" : pendingFriendsCount}
              </span>
            )}
            <span className="sr-only">Friends</span>
          </button>

          {/* 3. Find Groups */}
          <button
            type="button"
            onClick={() => onSelectTab(NAV_TAB.FIND_GROUPS)}
            className={`group relative flex items-center justify-center size-12 rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === NAV_TAB.FIND_GROUPS
                ? "bg-emerald-500/15 text-emerald-400 font-semibold shadow-inner"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80"
            }`}
            title="Find & Explore Groups"
          >
            {activeTab === NAV_TAB.FIND_GROUPS && (
              <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-emerald-500 rounded-r-full shadow-sm shadow-emerald-500" />
            )}
            <Compass className="size-5 transition-transform group-hover:scale-110" />
            <span className="sr-only">Find Groups</span>
          </button>

          {/* 4. Live Search */}
          <button
            type="button"
            onClick={() => onSelectTab(NAV_TAB.LIVE_SEARCH)}
            className={`group relative flex items-center justify-center size-12 rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === NAV_TAB.LIVE_SEARCH
                ? "bg-emerald-500/15 text-emerald-400 font-semibold shadow-inner"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80"
            }`}
            title="Live Search & Random Match"
          >
            {activeTab === NAV_TAB.LIVE_SEARCH && (
              <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-emerald-500 rounded-r-full shadow-sm shadow-emerald-500" />
            )}
            <Radio className="size-5 transition-transform group-hover:scale-110" />
            <span className="sr-only">Live Search</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Settings & Profile (WhatsApp Style) */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {/* Settings Button */}
        <button
          type="button"
          onClick={() => onSelectTab(NAV_TAB.SETTINGS)}
          className={`group relative flex items-center justify-center size-11 rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === NAV_TAB.SETTINGS
              ? "bg-emerald-500/15 text-emerald-400 font-semibold shadow-inner"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80"
          }`}
          title="Settings & Preferences"
        >
          {activeTab === NAV_TAB.SETTINGS && (
            <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-emerald-500 rounded-r-full shadow-sm shadow-emerald-500" />
          )}
          <Settings className="size-5 group-hover:rotate-45 transition-transform duration-300" />
          <span className="sr-only">Settings</span>
        </button>

        <div className="w-8 h-px bg-zinc-800/80 my-0.5" />

        {/* Profile Avatar Button with Live Presence Dot */}
        <button
          type="button"
          onClick={() => onSelectTab(NAV_TAB.PROFILE)}
          className={`group relative flex items-center justify-center size-11 rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === NAV_TAB.PROFILE
              ? "ring-2 ring-emerald-500"
              : "hover:ring-2 hover:ring-emerald-500/50"
          }`}
          title={`Profile: ${username || "Anonymous"}`}
        >
          {userAvatarUrl ? (
            <div
              className="size-9 rounded-xl overflow-hidden shadow-sm flex items-center justify-center"
              style={{ backgroundColor: userAvatarBg || "#10b981" }}
            >
              <Image
                src={userAvatarUrl}
                alt={username || "User Avatar"}
                width={36}
                height={36}
                className="size-9 object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="size-9 rounded-xl bg-zinc-850 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <User className="size-5" />
            </div>
          )}

          {/* User Presence Status Indicator */}
          <span
            className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full ring-2 ring-zinc-950 ${presenceStyle.color}`}
            title={`Status: ${presenceStyle.label}`}
          />
        </button>
      </div>
    </nav>
  );
};
