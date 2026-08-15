"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Radio,
  Shield,
  Loader2,
  Send,
  Smile,
  LogOut,
  CheckCheck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { LiveSearchViewProps } from "@/types/dashboard";
import { RANDOM_SEARCH_STATE } from "@/constants/dashboard";

export const LiveSearchView: React.FC<LiveSearchViewProps> = ({
  searchState,
  matchedPeer,
  onStartSearching,
  onCancelSearch,
  onLeaveChat,
  onFindNext,
  onSendMessage,
  onBackToGroups,
}) => {
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchSeconds, setSearchSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (searchState === RANDOM_SEARCH_STATE.SEARCHING) {
      setSearchSeconds(0);
      interval = setInterval(() => {
        setSearchSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [searchState]);

  // Auto-scroll on messages
  useEffect(() => {
    if (matchedPeer?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [matchedPeer?.messages]);

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

  // ─── 1. IDLE CONFIRMATION STATE ─────────────────────────────────
  if (searchState === RANDOM_SEARCH_STATE.IDLE) {
    return (
      <section className="flex-1 flex items-center justify-center h-full bg-zinc-950/70 p-4 select-none">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 text-center animate-fadeIn">
          {/* Brand & Radar Icon */}
          <div className="size-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Radio className="size-8 animate-pulse" />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Start Random Chat?
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
              You are about to be connected with a random user anonymously. Please be respectful and follow our community guidelines.
            </p>
          </div>

          {/* Safety Notice */}
          <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed flex items-start gap-2.5 text-left">
            <Shield className="size-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Your identity remains hidden, but your IP address is logged for safety purposes.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBackToGroups || onCancelSearch}
              className="flex-1 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onStartSearching}
              className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Radio className="size-4" />
              <span>Start Searching</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ─── 2. SEARCHING STATE ─────────────────────────────────────────
  if (searchState === RANDOM_SEARCH_STATE.SEARCHING) {
    return (
      <section className="flex-1 flex items-center justify-center h-full bg-zinc-950/70 p-4 select-none">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6 text-center animate-fadeIn">
          {/* Radar Animation */}
          <div className="relative size-24 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <span className="absolute inset-2 rounded-full bg-emerald-500/10 animate-pulse" />
            <div className="size-16 rounded-full bg-zinc-850 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl">
              <Loader2 className="size-8 animate-spin text-emerald-400" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-bold text-white">Searching for an Anonymous Peer...</h2>
            <p className="text-xs text-zinc-400">
              Matching with online strangers across encrypted channels.
            </p>
            <span className="text-xs font-mono text-emerald-400 mt-1">
              Time elapsed: {searchSeconds}s
            </span>
          </div>

          <button
            type="button"
            onClick={onCancelSearch}
            className="px-6 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
          >
            Cancel Search
          </button>
        </div>
      </section>
    );
  }

  // ─── 3. MATCHED CHAT STATE ──────────────────────────────────────
  if (!matchedPeer) return null;

  return (
    <section className="flex-1 flex flex-col h-full bg-zinc-950/70 relative overflow-hidden select-none animate-fadeIn">
      {/* ─── Match Header (WhatsApp Style with Leave Button) ───────── */}
      <header className="h-16 px-4 bg-zinc-900/90 border-b border-zinc-800/80 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div
              className="size-11 rounded-2xl overflow-hidden flex items-center justify-center shadow-md ring-1 ring-emerald-500/40"
              style={{ backgroundColor: matchedPeer.avatarBgColor || "#10b981" }}
            >
              {matchedPeer.avatarUrl ? (
                <Image
                  src={matchedPeer.avatarUrl}
                  alt={matchedPeer.name}
                  width={44}
                  height={44}
                  className="size-11 object-cover"
                  unoptimized
                />
              ) : (
                <Radio className="size-6 text-white" />
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900 animate-pulse" />
          </div>

          <div className="flex flex-col min-w-0">
            <h2 className="text-sm md:text-base font-bold text-zinc-100 truncate flex items-center gap-2">
              <span>{matchedPeer.name}</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Matched
              </span>
            </h2>
            <p className="text-[11px] text-emerald-400 font-medium truncate">
              Connected anonymously • Active now
            </p>
          </div>
        </div>

        {/* Top Actions: Next Match & Leave */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onFindNext}
            title="Skip & Match with next peer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Next Match</span>
          </button>

          <button
            type="button"
            onClick={onLeaveChat}
            title="Leave this anonymous chat"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="size-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* ─── Message Stream ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-zinc-800 bg-[radial-gradient(#27272a_1px,transparent_1px)] bg-size-[24px_24px]">
        {/* Encryption notice */}
        <div className="flex items-center justify-center my-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-400 shadow-sm">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>You are connected to an anonymous peer. Messages are end-to-end encrypted.</span>
          </div>
        </div>

        {matchedPeer.messages.map((msg) => {
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
                  {isMe && <CheckCheck className="size-3.5 text-emerald-200" />}
                </div>
              </div>
            </div>
          );
        })}

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

      {/* ─── Message Input Dock (NO Attachment icon) ───────────────── */}
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
              placeholder="Type an anonymous message to peer..."
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
