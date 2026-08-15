import { Group } from "./group";
import { Avatar } from "./user";

// ─── Navigation Tabs ──────────────────────────────────────────
export type NavTabId =
  | "groups"
  | "friends"
  | "find_groups"
  | "live_search"
  | "settings"
  | "profile";

export interface NavRailItem {
  id: NavTabId;
  label: string;
  badgeCount?: number;
}

// ─── Chat Filters ─────────────────────────────────────────────
export type ChatFilterId = "all" | "unread" | "groups" | "random";

// ─── Presence Statuses ────────────────────────────────────────
export type UserPresenceStatus = "online" | "away" | "busy" | "offline";

// ─── Live Search States ───────────────────────────────────────
export type RandomSearchState = "idle" | "searching" | "matched";

// ─── Settings Section IDs ─────────────────────────────────────
export type SettingsSectionId =
  | "presence"
  | "notifications"
  | "privacy"
  | "sessions"
  | "account";

// ─── Message Types & Statuses ─────────────────────────────────
export type MessageDeliveryStatus = "sent" | "delivered" | "read";
export type MessageSenderType = "me" | "other" | "system";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: Avatar | null;
  text: string;
  timestamp: string;
  status?: MessageDeliveryStatus;
  isMe: boolean;
  senderType: MessageSenderType;
}

// ─── Typing Status ────────────────────────────────────────────
export interface ChatTypingUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

// ─── Chat Room / Conversation ────────────────────────────────
export type ChatRoomType = "group" | "direct" | "random";

export interface ChatRoom {
  id: string;
  name: string;
  avatarUrl?: string | null;
  avatarBgColor?: string;
  type: ChatRoomType;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
  onlineCount?: number;
  totalMembers?: number;
  isPinned?: boolean;
  isMuted?: boolean;
  isJoined?: boolean;
  tags?: string[];
  description?: string;
  typingUsers?: ChatTypingUser[];
  messages: ChatMessage[];
}

// ─── Friends ──────────────────────────────────────────────────
export type FriendTabId = "all" | "online" | "pending";

export interface FriendItem {
  id: string;
  username: string;
  email?: string;
  avatar?: Avatar | null;
  status: UserPresenceStatus;
  statusMessage?: string;
  lastSeen?: string;
  isPending?: boolean;
  isIncomingRequest?: boolean;
  isTyping?: boolean;
}

// ─── Component Props ──────────────────────────────────────────
export interface NavRailProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  unreadChatCount: number;
  pendingFriendsCount: number;
  userAvatarUrl?: string | null;
  userAvatarBg?: string;
  userPresence: UserPresenceStatus;
  username?: string;
}

export interface SidebarListProps {
  activeTab: NavTabId;
  rooms: ChatRoom[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  activeFilter: ChatFilterId;
  onFilterChange: (filter: ChatFilterId) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateGroup: () => void;
  onStartDirectChat: (friend: FriendItem) => void;
  friends: FriendItem[];
  friendTab: FriendTabId;
  onFriendTabChange: (tab: FriendTabId) => void;
  onAddFriend: (username: string) => void;
  onAcceptFriend: (id: string) => void;
  onRejectFriend: (id: string) => void;
  // Settings Panel State
  selectedSettingsSection: SettingsSectionId;
  onSelectSettingsSection: (section: SettingsSectionId) => void;
  onBackFromSettings: () => void;
}

export interface ChatViewProps {
  room: ChatRoom;
  onSendMessage: (text: string) => void;
  onBackToList?: () => void;
  onToggleMute?: () => void;
  onToggleInfo?: () => void;
  isInfoOpen?: boolean;
}

export interface GroupsDefaultRightPaneProps {
  onFindGroupsClick: () => void;
  onLiveChatClick: () => void;
  onQuickJoinRoom: (roomId: string) => void;
  trendingRooms: ChatRoom[];
}

export interface FindGroupsViewProps {
  rooms: ChatRoom[];
  onJoinGroup: (roomId: string) => void;
  onOpenGroup: (roomId: string) => void;
  onBackToGroups?: () => void;
}

export interface LiveSearchViewProps {
  user: {
    id?: string;
    username?: string | null;
  };
  searchState: RandomSearchState;
  matchedPeer: ChatRoom | null;
  onStartSearching: () => void;
  onCancelSearch: () => void;
  onLeaveChat: () => void;
  onFindNext: () => void;
  onSendMessage: (text: string) => void;
  onBackToGroups?: () => void;
}

export interface SettingsRightPaneProps {
  section: SettingsSectionId;
  userPresence: UserPresenceStatus;
  onChangePresence: (status: UserPresenceStatus) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
  onSignOut: () => void;
  onGoToProfile: () => void;
  onBack: () => void;
  username?: string;
  email?: string;
  avatarUrl?: string | null;
  avatarBgColor?: string;
}

export interface ProfileViewProps {
  user: {
    id?: string;
    username?: string | null;
    email?: string;
    avatarStyle?: string | null;
    avatarSeed?: string | null;
    avatarBackgroundColor?: string | null;
  };
  onBack: () => void;
  onSignOut: () => void;
  userPresence: UserPresenceStatus;
  onChangePresence: (status: UserPresenceStatus) => void;
}

export interface ChatHeaderProps {
  group: Group;
  totalMembers: number;
  onlineMembers: number;
  onOpenDetails: () => void;
  onBackToDashboard: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleSimulation: () => void;
  isSimulationOpen: boolean;
  onToggleLayoutMode?: () => void;
}
