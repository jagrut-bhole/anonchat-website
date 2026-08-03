import { PAGE_ROUTES } from "@/lib/route";

export const headerNavItems = [
  {
    label: "Home",
    href: PAGE_ROUTES.HOME,
  },
  {
    label: "Live Chat",
    href: PAGE_ROUTES.LIVE_CHAT
  }
];

export const RANDOM_CHAT_STATUS = {
  IDLE: "idle",
  CONFIRMING: "confirming",
  MATCHING: "matching",
  CHATTING: "chatting",
} as const;

export type RandomChatStatus =
  (typeof RANDOM_CHAT_STATUS)[keyof typeof RANDOM_CHAT_STATUS];

  