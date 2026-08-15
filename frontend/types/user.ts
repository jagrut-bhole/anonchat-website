export interface User {
  id: string;
  username: string;
  avatar: Avatar;
  email: string;
  createdAt: string;
  status: UserStatus;
  lastSeen?: string;
  isCurrentUser?: boolean;
}

export type UserStatus = "online" | "offline" | "away";

export interface Avatar {
  avatarStyle?: string;
  avatarSeed?: string;
  avatarBackgroundColor?: string;
  avatarVersion?: string;
}
