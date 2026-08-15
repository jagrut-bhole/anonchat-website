import { User } from "./user";

export interface Group {
  id: string;
  name: string;
  logo: string;
  description: string;
  createdAt: string;
  createdBy: string;
  members: GroupMember[];
  
}

export interface GroupMember{
  user: User;
  role: UserRole;
  joinedAt: string
}

type UserRole = "admin" | "member";