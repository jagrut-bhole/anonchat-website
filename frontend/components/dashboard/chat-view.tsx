"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Search,
  Bell,
  BellOff,
  Info,
  Smile,
  Send,
  CheckCheck,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { ChatViewProps } from "@/types/dashboard";
import { MessageTyping } from "@/components/ui/typing-status";

export const ChatView: React.FC<ChatViewProps> = ({
  room,
  onSendMessage,
  onBackToList,
  onToggleMute,
  onToggleInfo,
  isInfoOpen = false,
}) => {
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inChatSearch, setInChatSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on room change or new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room.messages, room.typingUsers]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
    setShowEmojiPicker(false);
  };

  const handleInsertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const QUICK_EMOJIS = ["👋", "🔥", "🚀", "❤️", "😂", "✨", "🔒", "👀", "💯", "🎉"];

  const filteredMessages = inChatSearch.trim()
    ? room.messages.filter((m) =>
        m.text.toLowerCase().includes(inChatSearch.toLowerCase())
      )
    : room.messages;

  // Compute typing text for header
  const isSomeoneTyping = room.typingUsers && room.typingUsers.length > 0;
  const typingStatusText = isSomeoneTyping
    ? room.typingUsers!.length === 1
      ? `${room.typingUsers![0].name} is typing...`
      : `${room.typingUsers![0].name} and ${room.typingUsers!.length - 1} other${
          room.typingUsers!.length > 2 ? "s" : ""
        } typing...`
    : null;

  return (
    <section className="flex-1 flex flex-col h-full bg-zinc-950/70 relative overflow-hidden select-none">
      {/* ─── WhatsApp Header ──────────────────────────────────────── */}
      <header className="h-16 px-4 bg-zinc-900/90 border-b border-zinc-800/80 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        {/* Left: Back button (mobile) + Avatar + Room Info */}
        <div className="flex items-center gap-3 min-w-0">
          {onBackToList && (
            <button
              type="button"
              onClick={onBackToList}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors md:hidden"
              title="Back to group list"
            >
              <ArrowLeft className="size-5" />
            </button>
          )}

          {/* Avatar with live presence ring */}
          <div className="relative shrink-0 cursor-pointer" onClick={onToggleInfo}>
            <div
              className="size-10 rounded-2xl overflow-hidden flex items-center justify-center shadow-md ring-1 ring-zinc-700/50"
              style={{ backgroundColor: room.avatarBgColor || "#10b981" }}
            >
              {room.avatarUrl ? (
                <Image
                  src={room.avatarUrl}
                  alt={room.name}
                  width={40}
                  height={40}
                  className="size-10 object-cover"
                  unoptimized
                />
              ) : (
                <Users className="size-5 text-white" />
              )}
            </div>
            {room.isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />
            )}
          </div>

          {/* Title & Subtitle / Typing Indicator */}
          <div
            className="flex flex-col min-w-0 cursor-pointer group"
            onClick={onToggleInfo}
          >
            <h2 className="text-sm md:text-base font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
              {room.name}
            </h2>
            <div className="text-[11px] truncate flex items-center gap-1.5">
              {isSomeoneTyping ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1 animate-pulse">
                  <span>{typingStatusText}</span>
                </span>
              ) : room.type === "group" ? (
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-medium">
                    {room.onlineCount || 1} online
                  </span>
                  <span>•</span>
                  <span>{room.totalMembers || 2} members</span>
                </span>
              ) : (
                <span className="text-emerald-400 font-medium">
                  {room.isOnline ? "Active now" : "Offline"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1">
          {/* In-chat search */}
          {showSearch ? (
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-xs text-zinc-200 animate-fadeIn">
              <Search className="size-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={inChatSearch}
                onChange={(e) => setInChatSearch(e.target.value)}
                className="bg-transparent focus:outline-none w-28 sm:w-40 text-xs placeholder-zinc-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  setInChatSearch("");
                }}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSearch(true)}
              title="Search in conversation"
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <Search className="size-4" />
            </button>
          )}

          {/* Mute Toggle */}
          {onToggleMute && (
            <button
              type="button"
              onClick={onToggleMute}
              title={room.isMuted ? "Unmute conversation" : "Mute notifications"}
              className={`p-2 rounded-xl transition-colors ${
                room.isMuted
                  ? "text-amber-400 bg-amber-500/10"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {room.isMuted ? <BellOff className="size-4" /> : <Bell className="size-4" />}
            </button>
          )}

          {/* Info Details Toggle */}
          {onToggleInfo && (
            <button
              type="button"
              onClick={onToggleInfo}
              title="Room details & members"
              className={`p-2 rounded-xl transition-colors ${
                isInfoOpen
                  ? "text-emerald-400 bg-emerald-500/15"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              <Info className="size-4" />
            </button>
          )}
        </div>
      </header>

      {/* ─── Chat Message Stream ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-zinc-800 bg-[radial-gradient(#27272a_1px,transparent_1px)] bg-size-[24px_24px]">
        {/* End-to-End Encryption Banner */}
        <div className="flex items-center justify-center my-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-400 shadow-sm">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>Messages are pseudonymously encrypted. No personal identities are exposed.</span>
          </div>
        </div>

        {filteredMessages.map((msg) => {
          if (msg.senderType === "system") {
            return (
              <div key={msg.id} className="flex justify-center my-1">
                <span className="px-3 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 text-center">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isMe = msg.isMe;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-full`}
            >
              {!isMe && room.type === "group" && (
                <span className="text-[11px] font-semibold text-emerald-400 ml-3 mb-0.5">
                  {msg.senderName}
                </span>
              )}

              <div
                className={`relative px-4 py-2.5 rounded-2xl max-w-[85%] md:max-w-[70%] text-sm shadow-md transition-all ${
                  isMe
                    ? "bg-linear-to-br from-emerald-600 to-emerald-700 text-white rounded-tr-xs"
                    : "bg-zinc-850 border border-zinc-800 text-zinc-100 rounded-tl-xs"
                }`}
              >
                <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">{msg.text}</p>

                <div
                  className={`flex items-center justify-end gap-1 text-[10px] mt-1 select-none ${
                    isMe ? "text-emerald-200" : "text-zinc-400"
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isMe && (
                    <CheckCheck
                      className={`size-3.5 ${
                        msg.status === "read" ? "text-cyan-300" : "text-emerald-200"
                      }`}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Real-time Typing Status in Message Stream */}
        {isSomeoneTyping && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 text-emerald-400 text-xs w-fit">
            <MessageTyping />
            <span>{typingStatusText}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── Emoji Tray ───────────────────────────────────────────── */}
      {showEmojiPicker && (
        <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar animate-fadeIn">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleInsertEmoji(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* ─── WhatsApp Input Dock (No attachment icon) ──────────────── */}
      <footer className="p-3 md:p-4 bg-zinc-900/95 border-t border-zinc-800/80 backdrop-blur-md shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-5xl mx-auto">
          {/* Emoji Toggle */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Insert Emoji"
            className={`p-2.5 rounded-xl transition-colors ${
              showEmojiPicker
                ? "text-emerald-400 bg-emerald-500/15"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <Smile className="size-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type an anonymous message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            title="Send Message"
            className="p-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 text-zinc-950 font-bold transition-all shadow-md shadow-emerald-950/30 cursor-pointer"
          >
            <Send className="size-5" />
          </button>
        </form>
      </footer>
    </section>
  );
};
