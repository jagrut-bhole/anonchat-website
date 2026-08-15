"use client";

import React from "react";
import Image from "next/image";
import {
  Search,
  X,
  Plus,
  Users,
  Pin,
  Check,
  CheckCheck,
  UserPlus,
  MessageSquare,
  ArrowLeft,
  ChevronRight,
  Radio,
  Bell,
  Shield,
  Smartphone,
  User,
} from "lucide-react";
import {
  SidebarListProps,
  FriendTabId,
  SettingsSectionId,
  FriendItem,
} from "@/types/dashboard";
import {
  NAV_TAB,
  CHAT_FILTER,
  FRIEND_TAB,
  SETTINGS_SECTION,
  PRESENCE_CONFIG,
} from "@/constants/dashboard";
import { MessageTyping } from "@/components/ui/typing-status";

export const SidebarList: React.FC<SidebarListProps> = ({
  activeTab,
  rooms,
  selectedRoomId,
  onSelectRoom,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onCreateGroup,
  onStartDirectChat,
  friends,
  friendTab,
  onFriendTabChange,
  onAddFriend,
  onAcceptFriend,
  onRejectFriend,
  selectedSettingsSection,
  onSelectSettingsSection,
  onBackFromSettings,
}) => {
  const [showAddFriendInput, setShowAddFriendInput] = React.useState(false);
  const [newFriendUsername, setNewFriendUsername] = React.useState("");

  // Filter joined groups
  const joinedRooms = React.useMemo(() => {
    return rooms.filter((room) => {
      const isJoined = room.isJoined !== false && room.type !== "random";
      if (!isJoined) return false;

      const matchesSearch =
        searchQuery.trim() === "" ||
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.lastMessage && room.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeFilter === CHAT_FILTER.UNREAD) {
        return (room.unreadCount || 0) > 0;
      }
      return true;
    });
  }, [rooms, searchQuery, activeFilter]);

  // Filter friends
  const filteredFriends = React.useMemo(() => {
    return friends.filter((friend) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (friend.statusMessage &&
          friend.statusMessage.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (friendTab === FRIEND_TAB.ONLINE) {
        return friend.status === "online" && !friend.isPending;
      }
      if (friendTab === FRIEND_TAB.PENDING) {
        return friend.isPending === true;
      }
      return !friend.isPending;
    });
  }, [friends, searchQuery, friendTab]);

  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFriendUsername.trim()) {
      onAddFriend(newFriendUsername.trim());
      setNewFriendUsername("");
      setShowAddFriendInput(false);
    }
  };

  const getFriendAvatarUrl = (friend: FriendItem) => {
    if (friend.avatar?.avatarStyle && friend.avatar?.avatarSeed) {
      return `https://api.dicebear.com/10.x/${friend.avatar.avatarStyle}/svg?seed=${encodeURIComponent(
        friend.avatar.avatarSeed
      )}`;
    }
    return `https://api.dicebear.com/10.x/personas/svg?seed=${encodeURIComponent(friend.username)}`;
  };

  return (
    <aside className="w-full md:w-84 lg:w-96 bg-zinc-900/90 border-r border-zinc-800/80 flex flex-col h-full shrink-0 select-none overflow-hidden backdrop-blur-sm">
      {/* ─── Top Header ─────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-zinc-800/60 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {/* Header Title with Back Button for Settings & Profile */}
          <div className="flex items-center gap-2">
            {activeTab === NAV_TAB.SETTINGS && (
              <button
                type="button"
                onClick={onBackFromSettings}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Back to Groups"
              >
                <ArrowLeft className="size-5" />
              </button>
            )}

            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {activeTab === NAV_TAB.GROUPS && "Groups"}
              {activeTab === NAV_TAB.FRIENDS && "Friends"}
              {activeTab === NAV_TAB.SETTINGS && "Settings"}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {activeTab === NAV_TAB.GROUPS && (
              <button
                type="button"
                onClick={onCreateGroup}
                title="Create Anonymous Group"
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <Plus className="size-4" />
              </button>
            )}

            {activeTab === NAV_TAB.FRIENDS && (
              <button
                type="button"
                onClick={() => setShowAddFriendInput(!showAddFriendInput)}
                title="Add Friend by Username"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                <UserPlus className="size-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Friend Quick Input */}
        {activeTab === NAV_TAB.FRIENDS && showAddFriendInput && (
          <form
            onSubmit={handleAddFriendSubmit}
            className="flex items-center gap-2 bg-zinc-950/80 p-2 rounded-xl border border-emerald-500/40 animate-fadeIn"
          >
            <input
              type="text"
              placeholder="Enter anonymous username..."
              value={newFriendUsername}
              onChange={(e) => setNewFriendUsername(e.target.value)}
              className="flex-1 bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none px-2"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newFriendUsername.trim()}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-zinc-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddFriendInput(false)}
              className="p-1 text-zinc-400 hover:text-zinc-200"
            >
              <X className="size-4" />
            </button>
          </form>
        )}

        {/* Search Bar */}
        {activeTab !== NAV_TAB.SETTINGS && activeTab !== NAV_TAB.PROFILE && (
          <div className="relative flex items-center">
            <Search className="absolute left-3 size-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder={
                activeTab === NAV_TAB.GROUPS
                  ? "Search joined groups..."
                  : "Search friends..."
              }
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 text-zinc-500 hover:text-zinc-300"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Groups Filter Pills */}
        {activeTab === NAV_TAB.GROUPS && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
            <button
              type="button"
              onClick={() => onFilterChange(CHAT_FILTER.ALL)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeFilter === CHAT_FILTER.ALL
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-transparent"
              }`}
            >
              All Groups
            </button>
            <button
              type="button"
              onClick={() => onFilterChange(CHAT_FILTER.UNREAD)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeFilter === CHAT_FILTER.UNREAD
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-transparent"
              }`}
            >
              Unread
            </button>
          </div>
        )}

        {/* Friends Filter Pills */}
        {activeTab === NAV_TAB.FRIENDS && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
            {(
              [
                { id: FRIEND_TAB.ALL, label: "All Friends" },
                { id: FRIEND_TAB.ONLINE, label: "Online" },
                { id: FRIEND_TAB.PENDING, label: "Requests" },
              ] as { id: FriendTabId; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFriendTabChange(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  friendTab === tab.id
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Main List Body ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-850/40 scrollbar-thin scrollbar-thumb-zinc-800">
        {/* 1. GROUPS TAB (Joined Groups with WhatsApp-style typing status) */}
        {activeTab === NAV_TAB.GROUPS && (
          <>
            {joinedRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500">
                <Users className="size-8 stroke-1 text-zinc-600 mb-2" />
                <p className="text-xs font-medium text-zinc-400">No joined groups</p>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Explore groups via Find Groups or create your own circle.
                </p>
              </div>
            ) : (
              joinedRooms.map((room) => {
                const isSelected = selectedRoomId === room.id;
                const isSomeoneTyping = room.typingUsers && room.typingUsers.length > 0;

                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => onSelectRoom(room.id)}
                    className={`w-full text-left flex items-center gap-3 px-3.5 py-3 transition-all cursor-pointer group ${
                      isSelected
                        ? "bg-zinc-800/95 border-l-4 border-emerald-500 pl-2.5 shadow-sm"
                        : "hover:bg-zinc-850/60 border-l-4 border-transparent"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className="size-11 rounded-2xl overflow-hidden flex items-center justify-center shadow-md ring-1 ring-zinc-700/50"
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
                      {room.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />
                      )}
                    </div>

                    {/* Room Details */}
                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          {room.isPinned && <Pin className="size-3 text-zinc-400 rotate-45 shrink-0" />}
                          <span
                            className={`text-sm font-semibold truncate ${
                              isSelected ? "text-emerald-400" : "text-zinc-200 group-hover:text-white"
                            }`}
                          >
                            {room.name}
                          </span>
                        </div>
                        {room.lastMessageTime && (
                          <span
                            className={`text-[11px] shrink-0 font-medium ${
                              room.unreadCount ? "text-emerald-400 font-bold" : "text-zinc-500"
                            }`}
                          >
                            {room.lastMessageTime}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        {isSomeoneTyping ? (
                          <div className="text-xs text-emerald-400 font-medium truncate flex items-center gap-1.5">
                            <MessageTyping />
                            <span className="truncate">
                              {room.typingUsers!.length === 1
                                ? `${room.typingUsers![0].name} typing...`
                                : `${room.typingUsers!.length} people typing...`}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-400 truncate flex items-center gap-1">
                            {room.messages?.[room.messages.length - 1]?.isMe && (
                              <CheckCheck className="size-3.5 text-emerald-400 shrink-0" />
                            )}
                            <span className="truncate">{room.lastMessage || "No messages yet"}</span>
                          </p>
                        )}

                        {room.unreadCount && room.unreadCount > 0 ? (
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-zinc-950">
                            {room.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </>
        )}

        {/* 2. FRIENDS TAB (with WhatsApp-style typing indicator) */}
        {activeTab === NAV_TAB.FRIENDS && (
          <>
            {filteredFriends.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500">
                <Users className="size-8 stroke-1 text-zinc-600 mb-2" />
                <p className="text-xs font-medium text-zinc-400">No friends found</p>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Click Add above to connect with anonymous users.
                </p>
              </div>
            ) : (
              filteredFriends.map((friend) => {
                const presence = PRESENCE_CONFIG[friend.status] || PRESENCE_CONFIG.online;
                const avatarUrl = getFriendAvatarUrl(friend);

                return (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between gap-3 px-3.5 py-3 hover:bg-zinc-850/60 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <div
                          className="size-11 rounded-2xl overflow-hidden flex items-center justify-center ring-1 ring-zinc-700/50 shadow-md"
                          style={{
                            backgroundColor:
                              friend.avatar?.avatarBackgroundColor || "#8b5cf6",
                          }}
                        >
                          <Image
                            src={avatarUrl}
                            alt={friend.username}
                            width={44}
                            height={44}
                            className="size-11 object-cover"
                            unoptimized
                          />
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full ring-2 ring-zinc-900 ${presence.color}`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-zinc-200 group-hover:text-white truncate">
                          {friend.username}
                        </p>
                        {friend.isTyping ? (
                          <div className="text-[11px] text-emerald-400 font-medium truncate flex items-center gap-1">
                            <MessageTyping />
                            <span>typing...</span>
                          </div>
                        ) : (
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {friend.statusMessage || presence.label}
                          </p>
                        )}
                      </div>
                    </div>

                    {friend.isPending ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onAcceptFriend(friend.id)}
                          title="Accept Request"
                          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 transition-colors cursor-pointer"
                        >
                          <Check className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRejectFriend(friend.id)}
                          title="Decline Request"
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onStartDirectChat(friend)}
                        title="Send Direct Message"
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 text-zinc-300 transition-all cursor-pointer shrink-0"
                      >
                        <MessageSquare className="size-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* 3. SETTINGS TAB (Menu Options on Left Pane) */}
        {activeTab === NAV_TAB.SETTINGS && (
          <div className="p-3 flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-zinc-400 px-2 py-1 uppercase tracking-wider">
              Preferences
            </p>
            {(
              [
                {
                  id: SETTINGS_SECTION.PRESENCE,
                  label: "Presence & Status",
                  icon: Radio,
                  desc: "Availability & online badge",
                },
                {
                  id: SETTINGS_SECTION.NOTIFICATIONS,
                  label: "Notifications & Sound",
                  icon: Bell,
                  desc: "Push badges & sound alerts",
                },
                {
                  id: SETTINGS_SECTION.PRIVACY,
                  label: "Privacy & Radius",
                  icon: Shield,
                  desc: "Zero-knowledge encryption",
                },
                {
                  id: SETTINGS_SECTION.SESSIONS,
                  label: "Active Sessions",
                  icon: Smartphone,
                  desc: "Tokens & connected devices",
                },
                {
                  id: SETTINGS_SECTION.ACCOUNT,
                  label: "Account Info",
                  icon: User,
                  desc: "Pseudonym & authentication",
                },
              ] as {
                id: SettingsSectionId;
                label: string;
                icon: React.ComponentType<{ className?: string }>;
                desc: string;
              }[]
            ).map((item) => {
              const Icon = item.icon;
              const isSelected = selectedSettingsSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSettingsSection(item.id)}
                  className={`w-full text-left flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                    isSelected
                      ? "bg-zinc-800 border border-emerald-500/40 text-white shadow-sm"
                      : "hover:bg-zinc-850/60 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        isSelected ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[11px] text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-zinc-500" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
