"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getMe, checkOnboardingStatus, type AuthUser } from "@/lib/auth-api";
import { PAGE_ROUTES } from "@/lib/route";
import buildPreviewUrl from "@/utils/onboardingFunc";

// Types and Constants
import {
  NavTabId,
  ChatFilterId,
  UserPresenceStatus,
  FriendTabId,
  SettingsSectionId,
  RandomSearchState,
  ChatRoom,
  ChatMessage,
  FriendItem,
} from "@/types/dashboard";
import {
  NAV_TAB,
  CHAT_FILTER,
  USER_PRESENCE,
  FRIEND_TAB,
  SETTINGS_SECTION,
  RANDOM_SEARCH_STATE,
  INITIAL_CHAT_ROOMS,
  INITIAL_FRIENDS,
} from "@/constants/dashboard";

// Dashboard Components
import { NavRail } from "@/components/dashboard/nav-rail";
import { SidebarList } from "@/components/dashboard/sidebar-list";
import { ChatView } from "@/components/dashboard/chat-view";
import { GroupsDefaultPane } from "@/components/dashboard/groups-default-pane";
import { FindGroupsView } from "@/components/dashboard/find-groups-view";
import { LiveSearchView } from "@/components/dashboard/live-search-view";
import { SettingsPane } from "@/components/dashboard/settings-pane";
import { ProfileView } from "@/components/dashboard/profile-view";

export default function DashboardClient() {
  const router = useRouter();

  // ─── Auth & User State ──────────────────────────────────────
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── Dashboard Navigation & UI State ────────────────────────
  const [activeTab, setActiveTab] = useState<NavTabId>(NAV_TAB.GROUPS);
  const [activeFilter, setActiveFilter] = useState<ChatFilterId>(CHAT_FILTER.ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [friendTab, setFriendTab] = useState<FriendTabId>(FRIEND_TAB.ALL);
  const [userPresence, setUserPresence] = useState<UserPresenceStatus>(USER_PRESENCE.ONLINE);
  const [selectedSettingsSection, setSelectedSettingsSection] = useState<SettingsSectionId>(
    SETTINGS_SECTION.PRESENCE
  );

  // ─── Live Search Interactive State ──────────────────────────
  const [randomSearchState, setRandomSearchState] = useState<RandomSearchState>(
    RANDOM_SEARCH_STATE.IDLE
  );
  const [matchedPeerRoom, setMatchedPeerRoom] = useState<ChatRoom | null>(null);

  // ─── Chat & Data State ──────────────────────────────────────
  const [rooms, setRooms] = useState<ChatRoom[]>(INITIAL_CHAT_ROOMS);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [friends, setFriends] = useState<FriendItem[]>(INITIAL_FRIENDS);

  // ─── Preferences State ──────────────────────────────────────
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // ─── Authentication & Session Check ─────────────────────────
  useEffect(() => {
    async function init() {
      const [meResult, onboardingResult] = await Promise.all([
        getMe(),
        checkOnboardingStatus(),
      ]);

      if (meResult.error || !meResult.data?.user) {
        router.replace(PAGE_ROUTES.AUTH.SIGN_IN);
        return;
      }

      const onboardingCompleted =
        onboardingResult.data?.onboardingCompleted ?? false;

      if (!onboardingCompleted) {
        router.replace(PAGE_ROUTES.ONBOARDING);
        return;
      }

      setUser({
        ...meResult.data.user,
        avatarStyle: onboardingResult.data?.avatarStyle ?? null,
        avatarSeed: onboardingResult.data?.avatarSeed ?? null,
        avatarBackgroundColor:
          onboardingResult.data?.avatarBackgroundColor ?? null,
        onboardingCompleted,
      });

      setLoading(false);
    }

    init();
  }, [router]);

  // ─── Computed Values ────────────────────────────────────────
  const userAvatarUrl = useMemo(() => {
    if (user?.avatarStyle && user?.avatarSeed) {
      return buildPreviewUrl(
        user.avatarStyle,
        user.avatarSeed,
        user.avatarBackgroundColor || undefined
      );
    }
    return null;
  }, [user]);

  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || null;
  }, [rooms, selectedRoomId]);

  const unreadChatCount = useMemo(() => {
    return rooms.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
  }, [rooms]);

  const pendingFriendsCount = useMemo(() => {
    return friends.filter((f) => f.isPending).length;
  }, [friends]);

  const trendingRooms = useMemo(() => {
    return rooms.filter((r) => r.type === "group");
  }, [rooms]);

  // Determine if sidebar list should be visible
  const isSidebarVisible = useMemo(() => {
    return (
      activeTab !== NAV_TAB.FIND_GROUPS &&
      activeTab !== NAV_TAB.LIVE_SEARCH &&
      activeTab !== NAV_TAB.PROFILE
    );
  }, [activeTab]);

  // ─── Actions & Handlers ─────────────────────────────────────
  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveTab(NAV_TAB.GROUPS);
    setIsMobileChatOpen(true);

    // Clear unread count for selected room
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      )
    );
  };

  const handleSendMessage = (text: string) => {
    if (!selectedRoomId) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || "me",
      senderName: user?.username || "You",
      text,
      timestamp: timeString,
      status: "delivered",
      isMe: true,
      senderType: "me",
    };

    setRooms((prev) =>
      prev.map((room) => {
        if (room.id === selectedRoomId) {
          return {
            ...room,
            lastMessage: text,
            lastMessageTime: timeString,
            messages: [...room.messages, newMessage],
          };
        }
        return room;
      })
    );
  };

  // ─── Live Search Matchmaking Logic ──────────────────────────
  const startSearchingPeer = () => {
    setRandomSearchState(RANDOM_SEARCH_STATE.SEARCHING);
    setMatchedPeerRoom(null);

    // Simulate online random matching after 2.5 seconds
    setTimeout(() => {
      const strangerNumber = Math.floor(100 + Math.random() * 900);
      const matchedRoom: ChatRoom = {
        id: `peer-${Date.now()}`,
        name: `Masked Stranger #${strangerNumber}`,
        avatarUrl: `https://api.dicebear.com/10.x/avataaars/svg?seed=stranger-${strangerNumber}`,
        avatarBgColor: "#10b981",
        type: "random",
        isJoined: true,
        lastMessage: "Say hi to your anonymous match!",
        lastMessageTime: "Just now",
        unreadCount: 0,
        isOnline: true,
        description: "Anonymous 1-on-1 peer session.",
        messages: [
          {
            id: `sys-${Date.now()}`,
            senderId: "system",
            senderName: "System",
            text: `🔒 Matched with Masked Stranger #${strangerNumber}. Say hello!`,
            timestamp: "Just now",
            isMe: false,
            senderType: "system",
          },
        ],
      };

      setMatchedPeerRoom(matchedRoom);
      setRandomSearchState(RANDOM_SEARCH_STATE.MATCHED);
      toast.success(`Matched with Masked Stranger #${strangerNumber}!`);
    }, 2500);
  };

  const handleLiveSearchMessage = (text: string) => {
    if (!matchedPeerRoom) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage: ChatMessage = {
      id: `live-msg-${Date.now()}`,
      senderId: user?.id || "me",
      senderName: user?.username || "You",
      text,
      timestamp: timeString,
      status: "delivered",
      isMe: true,
      senderType: "me",
    };

    setMatchedPeerRoom((prev) =>
      prev
        ? {
            ...prev,
            lastMessage: text,
            lastMessageTime: timeString,
            messages: [...prev.messages, newMessage],
          }
        : null
    );
  };

  const handleLeaveLiveChat = () => {
    setMatchedPeerRoom(null);
    setRandomSearchState(RANDOM_SEARCH_STATE.IDLE);
    toast.info("Left the anonymous chat");
  };

  const handleCreateGroup = () => {
    const groupNumber = Math.floor(10 + Math.random() * 90);
    const newGroupId = `group-${Date.now()}`;
    const newGroup: ChatRoom = {
      id: newGroupId,
      name: `⚡ Anonymous Circle #${groupNumber}`,
      avatarUrl: `https://api.dicebear.com/10.x/shapes/svg?seed=circle-${groupNumber}`,
      avatarBgColor: "#8b5cf6",
      type: "group",
      isJoined: true,
      lastMessage: "Group created. Invite friends or chat anonymously.",
      lastMessageTime: "Just now",
      unreadCount: 0,
      isOnline: true,
      onlineCount: 1,
      totalMembers: 1,
      tags: ["Circle", "Private"],
      description: "Custom anonymous group room.",
      messages: [
        {
          id: `sys-grp-${Date.now()}`,
          senderId: "system",
          senderName: "System",
          text: `⚡ You created Anonymous Circle #${groupNumber}.`,
          timestamp: "Just now",
          isMe: false,
          senderType: "system",
        },
      ],
    };

    setRooms((prev) => [newGroup, ...prev]);
    setSelectedRoomId(newGroupId);
    setActiveTab(NAV_TAB.GROUPS);
    setIsMobileChatOpen(true);
    toast.success(`Created Anonymous Circle #${groupNumber}`);
  };

  const handleJoinGroup = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, isJoined: true } : r))
    );
  };

  const handleStartDirectChat = (friend: FriendItem) => {
    const existingRoom = rooms.find(
      (r) => r.type === "direct" && r.name === friend.username
    );

    if (existingRoom) {
      setSelectedRoomId(existingRoom.id);
      setActiveTab(NAV_TAB.GROUPS);
      setIsMobileChatOpen(true);
      return;
    }

    const newDirectId = `direct-${friend.id}`;
    const avatarUrl =
      friend.avatar?.avatarStyle && friend.avatar?.avatarSeed
        ? `https://api.dicebear.com/10.x/${friend.avatar.avatarStyle}/svg?seed=${friend.avatar.avatarSeed}`
        : null;

    const newDirectRoom: ChatRoom = {
      id: newDirectId,
      name: friend.username,
      avatarUrl,
      avatarBgColor: friend.avatar?.avatarBackgroundColor || "#ec4899",
      type: "direct",
      isJoined: true,
      lastMessage: "Start direct encrypted conversation.",
      lastMessageTime: "Just now",
      unreadCount: 0,
      isOnline: friend.status === USER_PRESENCE.ONLINE,
      description: `Direct conversation with ${friend.username}.`,
      messages: [
        {
          id: `direct-sys-${Date.now()}`,
          senderId: "system",
          senderName: "System",
          text: `🔒 Direct encrypted channel with ${friend.username} initialized.`,
          timestamp: "Just now",
          isMe: false,
          senderType: "system",
        },
      ],
    };

    setRooms((prev) => [newDirectRoom, ...prev]);
    setSelectedRoomId(newDirectId);
    setActiveTab(NAV_TAB.GROUPS);
    setIsMobileChatOpen(true);
  };

  const handleAddFriend = (username: string) => {
    const newFriend: FriendItem = {
      id: `f-${Date.now()}`,
      username,
      avatar: {
        avatarStyle: "personas",
        avatarSeed: username,
        avatarBackgroundColor: "#10b981",
      },
      status: USER_PRESENCE.ONLINE,
      statusMessage: "Connected anonymously",
      lastSeen: "Active now",
      isPending: false,
    };

    setFriends((prev) => [newFriend, ...prev]);
    toast.success(`Added ${username} to friends!`);
  };

  const handleAcceptFriend = (id: string) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isPending: false } : f))
    );
    toast.success("Friend request accepted!");
  };

  const handleRejectFriend = (id: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
    toast.info("Friend request declined");
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    toast.success("Signed out successfully");
    router.push(PAGE_ROUTES.AUTH.SIGN_IN);
    router.refresh();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-emerald-500" />
          <p className="text-xs text-zinc-400 font-medium">Loading AnonChat...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden flex bg-zinc-950 text-zinc-100 font-sans select-none">
      {/* ─── 1. Left Vertical Nav Rail ──────────────────────────── */}
      <NavRail
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === NAV_TAB.SETTINGS || tab === NAV_TAB.PROFILE) {
            setSelectedRoomId(null);
          }
          if (tab === NAV_TAB.FIND_GROUPS || tab === NAV_TAB.LIVE_SEARCH) {
            setSelectedRoomId(null);
          }
        }}
        unreadChatCount={unreadChatCount}
        pendingFriendsCount={pendingFriendsCount}
        userAvatarUrl={userAvatarUrl}
        userAvatarBg={user?.avatarBackgroundColor || "#10b981"}
        userPresence={userPresence}
        username={user?.username || "Anonymous"}
      />

      {/* ─── 2. WhatsApp List Pane (Sidebar) ─────────────────────── */}
      {isSidebarVisible && (
        <div
          className={`${
            isMobileChatOpen && selectedRoom ? "hidden md:flex" : "flex"
          } h-full`}
        >
          <SidebarList
            activeTab={activeTab}
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={handleSelectRoom}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreateGroup={handleCreateGroup}
            onStartDirectChat={handleStartDirectChat}
            friends={friends}
            friendTab={friendTab}
            onFriendTabChange={setFriendTab}
            onAddFriend={handleAddFriend}
            onAcceptFriend={handleAcceptFriend}
            onRejectFriend={handleRejectFriend}
            selectedSettingsSection={selectedSettingsSection}
            onSelectSettingsSection={setSelectedSettingsSection}
            onBackFromSettings={() => setActiveTab(NAV_TAB.GROUPS)}
          />
        </div>
      )}

      {/* ─── 3. Main Content Pane ─────────────────────────────────── */}
      <div
        className={`${
          !isMobileChatOpen && !selectedRoom && isSidebarVisible ? "hidden md:flex" : "flex"
        } flex-1 h-full overflow-hidden`}
      >
        {/* 1. FIND GROUPS FULL-WIDTH VIEW (No Sidebar) */}
        {activeTab === NAV_TAB.FIND_GROUPS ? (
          <FindGroupsView
            rooms={rooms}
            onJoinGroup={handleJoinGroup}
            onOpenGroup={(roomId) => {
              handleSelectRoom(roomId);
              setActiveTab(NAV_TAB.GROUPS);
            }}
            onBackToGroups={() => setActiveTab(NAV_TAB.GROUPS)}
          />
        ) : activeTab === NAV_TAB.LIVE_SEARCH ? (
          /* 2. LIVE SEARCH / RANDOM CHAT VIEW (No Sidebar) */
          <LiveSearchView
            user={{ id: user?.id, username: user?.username }}
            searchState={randomSearchState}
            matchedPeer={matchedPeerRoom}
            onStartSearching={startSearchingPeer}
            onCancelSearch={() => setRandomSearchState(RANDOM_SEARCH_STATE.IDLE)}
            onLeaveChat={handleLeaveLiveChat}
            onFindNext={startSearchingPeer}
            onSendMessage={handleLiveSearchMessage}
            onBackToGroups={() => setActiveTab(NAV_TAB.GROUPS)}
          />
        ) : activeTab === NAV_TAB.PROFILE ? (
          /* 3. PROFILE VIEW */
          <ProfileView
            user={{
              id: user?.id,
              username: user?.username,
              email: user?.email,
              avatarStyle: user?.avatarStyle,
              avatarSeed: user?.avatarSeed,
              avatarBackgroundColor: user?.avatarBackgroundColor,
            }}
            onBack={() => setActiveTab(NAV_TAB.GROUPS)}
            onSignOut={handleSignOut}
            userPresence={userPresence}
            onChangePresence={(status) => {
              setUserPresence(status);
              toast.success(`Status updated to ${status}`);
            }}
          />
        ) : activeTab === NAV_TAB.SETTINGS ? (
          /* 4. SETTINGS VIEW */
          <SettingsPane
            section={selectedSettingsSection}
            userPresence={userPresence}
            onChangePresence={(status) => {
              setUserPresence(status);
              toast.success(`Status updated to ${status}`);
            }}
            soundEnabled={soundEnabled}
            onToggleSound={setSoundEnabled}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={setNotificationsEnabled}
            onSignOut={handleSignOut}
            onGoToProfile={() => setActiveTab(NAV_TAB.PROFILE)}
            onBack={() => setActiveTab(NAV_TAB.GROUPS)}
            username={user?.username || "Anonymous"}
            email={user?.email}
            avatarUrl={userAvatarUrl}
            avatarBgColor={user?.avatarBackgroundColor || "#10b981"}
          />
        ) : selectedRoom ? (
          /* 5. ACTIVE CHAT VIEW */
          <ChatView
            room={selectedRoom}
            onSendMessage={handleSendMessage}
            onBackToList={() => {
              setIsMobileChatOpen(false);
              setSelectedRoomId(null);
            }}
            onToggleMute={() => {
              setRooms((prev) =>
                prev.map((r) =>
                  r.id === selectedRoom.id ? { ...r, isMuted: !r.isMuted } : r
                )
              );
            }}
            onToggleInfo={() => {
              toast.info(
                `${selectedRoom.name}: ${
                  selectedRoom.description || "Active encrypted room"
                }`
              );
            }}
          />
        ) : (
          /* 6. GROUPS DEFAULT LANDING PANE */
          <GroupsDefaultPane
            onFindGroupsClick={() => {
              setActiveTab(NAV_TAB.FIND_GROUPS);
            }}
            onLiveChatClick={() => {
              setActiveTab(NAV_TAB.LIVE_SEARCH);
            }}
            onQuickJoinRoom={(roomId) => {
              handleJoinGroup(roomId);
              handleSelectRoom(roomId);
              setActiveTab(NAV_TAB.GROUPS);
            }}
            trendingRooms={trendingRooms}
          />
        )}
      </div>
    </main>
  );
}
