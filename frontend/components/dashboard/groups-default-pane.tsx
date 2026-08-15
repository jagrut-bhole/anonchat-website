"use client";

import React from "react";
import Image from "next/image";
import {
  Compass,
  Radio,
  Zap,
  Users,
  Lock,
} from "lucide-react";
import { GroupsDefaultRightPaneProps } from "@/types/dashboard";

export const GroupsDefaultPane: React.FC<GroupsDefaultRightPaneProps> = ({
  onFindGroupsClick,
  onLiveChatClick,
  onQuickJoinRoom,
  trendingRooms,
}) => {
  return (
    <section className="flex-1 flex flex-col h-full bg-zinc-950/70 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-zinc-800 select-none">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
        {/* Top Context & Quick Links */}
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="size-4 text-emerald-400" />
              <span>AnonChat Anonymous Groups</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select a joined group from the left or explore new live anonymous rooms.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onFindGroupsClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all cursor-pointer"
            >
              <Compass className="size-3.5 text-emerald-400" />
              <span>Find Groups</span>
            </button>

            <button
              type="button"
              onClick={onLiveChatClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
            >
              <Radio className="size-3.5" />
              <span>Live Search</span>
            </button>
          </div>
        </div>

        {/* Trending Anonymous Rooms (Only 1 to 4) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Zap className="size-4 text-emerald-400" />
              <span>Trending Anonymous Chat Rooms</span>
            </h3>
            <span className="text-xs text-zinc-500">Popular right now</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trendingRooms.slice(0, 4).map((room) => (
              <div
                key={room.id}
                className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="size-11 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center shadow-md"
                    style={{ backgroundColor: room.avatarBgColor || "#10b981" }}
                  >
                    {room.avatarUrl ? (
                      <Image
                        src={room.avatarUrl}
                        alt={room.name}
                        width={44}
                        height={44}
                        className="size-11 object-cover"
                        unoptimized
                      />
                    ) : (
                      <Users className="size-6 text-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
                      {room.name}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {room.description || room.lastMessage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {room.onlineCount || 1} online
                  </span>

                  <button
                    type="button"
                    onClick={() => onQuickJoinRoom(room.id)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {room.isJoined ? "Open Chat" : "Join Group"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
