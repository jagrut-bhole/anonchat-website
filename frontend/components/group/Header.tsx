"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { LogOut, MessageCircle, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import mask from "@/public/images/mask.png";
import { RANDOM_CHAT_STATUS, type RandomChatStatus } from "@/constants/header";
import { authClient } from "@/lib/auth-client";

export default function Header() {
  const router = useRouter();
  const [chatState, setChatState] = useState<RandomChatStatus>(
    RANDOM_CHAT_STATUS.IDLE,
  );

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-foreground text-white backdrop-blur supports-backdrop-filter:bg-black/60 mt-2">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-0.5 hover:opacity-90 transition-opacity"
        >
          <Image
            src={mask}
            alt="logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            AnonChat
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-1.5 cursor-pointer"
            onClick={() => setChatState("confirming")}
          >
            <MessageCircle className="h-4 w-4 text-foreground " />
            <span className="hidden sm:inline text-foreground">
              Chat with Random
            </span>
            <span className="sm:hidden">Random</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    A
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-black border-gray-500"
            >
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-white"
                onClick={() => router.push("/profile")}
              >
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-800" />
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-red-500"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
