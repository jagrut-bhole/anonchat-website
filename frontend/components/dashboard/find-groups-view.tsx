"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  Users,
  Compass,
  ArrowLeft,
  X,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { FindGroupsViewProps, ChatRoom } from "@/types/dashboard";

export const FindGroupsView: React.FC<FindGroupsViewProps> = ({
  rooms,
  onJoinGroup,
  onOpenGroup,
  onBackToGroups,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [joinedModalGroup, setJoinedModalGroup] = useState<ChatRoom | null>(null);

  // Show ONLY unjoined groups
  const unjoinedRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (room.type !== "group") return false;
      // Only unjoined groups
      if (room.isJoined) return false;

      const matchesSearch =
        searchQuery.trim() === "" ||
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [rooms, searchQuery]);

  const handleJoinClick = (room: ChatRoom) => {
    setJoiningGroupId(room.id);
    setTimeout(() => {
      onJoinGroup(room.id);
      setJoiningGroupId(null);
      setJoinedModalGroup(room);
    }, 700);
  };

  return (
    <section className="flex-1 flex flex-col h-full bg-zinc-950/70 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-zinc-800 select-none relative">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div className="flex items-center gap-3">
            {onBackToGroups && (
              <button
                type="button"
                onClick={onBackToGroups}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Back to Groups"
              >
                <ArrowLeft className="size-5" />
              </button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Compass className="size-6 text-emerald-400" />
                <span>Find & Explore Groups</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Discover interest-based encrypted communities and join discussions.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72 flex items-center">
            <Search className="absolute left-3 size-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search groups by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-9 pr-8 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-zinc-500 hover:text-zinc-300"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Group Cards Grid: 2 IN A ROW */}
        {unjoinedRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500">
            <Users className="size-12 stroke-1 text-zinc-600 mb-3" />
            <p className="text-sm font-semibold text-zinc-300">
              {searchQuery.trim()
                ? "No matching unjoined groups found"
                : "You have joined all available groups!"}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {searchQuery.trim()
                ? "Try searching for a different group name."
                : "Check your Groups tab on the left to start chatting."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unjoinedRooms.map((room) => {
              const isJoining = joiningGroupId === room.id;

              return (
                <div
                  key={room.id}
                  className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between gap-4 shadow-lg group"
                >
                  {/* Logo & Info */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className="size-13 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center shadow-md ring-1 ring-zinc-700/60"
                      style={{ backgroundColor: room.avatarBgColor || "#10b981" }}
                    >
                      {room.avatarUrl ? (
                        <Image
                          src={room.avatarUrl}
                          alt={room.name}
                          width={52}
                          height={52}
                          className="size-13 object-cover"
                          unoptimized
                        />
                      ) : (
                        <Users className="size-7 text-white" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
                        {room.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {room.description || "Active encrypted discussion room."}
                      </p>
                    </div>
                  </div>

                  {/* Member Counts & Join Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{room.onlineCount || 1} live</span>
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-400">{room.totalMembers || 2} total</span>
                    </div>

                    <button
                      type="button"
                      disabled={isJoining}
                      onClick={() => handleJoinClick(room)}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-zinc-950 shadow-md shadow-emerald-950/40 flex items-center gap-1.5"
                    >
                      {isJoining ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Joining...</span>
                        </>
                      ) : (
                        <span>Join Group</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Group Joined Confirmation Modal ───────────────────────── */}
      {joinedModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center gap-5 text-center relative animate-scaleUp">
            {/* Success Icon */}
            <div className="size-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="size-8 text-emerald-400" />
            </div>

            {/* Title & Info */}
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-bold text-white tracking-tight">Group Joined!</h2>
              <p className="text-xs text-zinc-400">
                You are now an anonymous member of this group.
              </p>
            </div>

            {/* Group Preview Card */}
            <div className="w-full p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3.5 text-left">
              <div
                className="size-12 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center shadow-md ring-1 ring-zinc-700/60"
                style={{
                  backgroundColor: joinedModalGroup.avatarBgColor || "#10b981",
                }}
              >
                {joinedModalGroup.avatarUrl ? (
                  <Image
                    src={joinedModalGroup.avatarUrl}
                    alt={joinedModalGroup.name}
                    width={48}
                    height={48}
                    className="size-12 object-cover"
                    unoptimized
                  />
                ) : (
                  <Users className="size-6 text-white" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-zinc-100 truncate">
                  {joinedModalGroup.name}
                </h3>
                <p className="text-xs text-emerald-400 font-medium mt-0.5">
                  {joinedModalGroup.totalMembers || 2} members • {joinedModalGroup.onlineCount || 1} online
                </p>
              </div>
            </div>

            {/* Modal Buttons: Close vs View Group */}
            <div className="flex items-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => setJoinedModalGroup(null)}
                className="flex-1 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetId = joinedModalGroup.id;
                  setJoinedModalGroup(null);
                  onOpenGroup(targetId);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>View Group</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
