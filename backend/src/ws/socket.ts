import { WebSocket } from "ws";
import { redis } from "@/lib/redis/redis";

export const RANDOM_QUEUE_KEY = "random:queue";

// ============================================================
// GROUP CHAT — Types & State
// ============================================================

export interface ClientMeta {
  userId: string;
  username: string;
  groupId: string;
}

export interface IncomingMessage {
  type: string;
  groupId?: string;
  userId?: string;
  username?: string;
  content?: string;
}

export const groupRooms = new Map<string, Set<WebSocket>>();
export const clientMeta = new Map<WebSocket, ClientMeta>();

// ============================================================
// RANDOM CHAT — Types & State
// ============================================================

export interface RandomUserMeta {
  userId: string;
  username: string;
}

// userId → WebSocket for users waiting in the Redis queue
export const waitingUsers = new Map<string, WebSocket>();
// Each socket → their paired partner socket
export const randomPairs = new Map<WebSocket, WebSocket>();
// Each socket → their random chat metadata
export const randomMeta = new Map<WebSocket, RandomUserMeta>();

// ============================================================
// RANDOM CHAT — Helper Functions
// ============================================================

export function sendJson(socket: WebSocket, data: object) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

/**
 * Pair two users together for a random chat.
 */

export function pairUsers(
  socketA: WebSocket,
  metaA: RandomUserMeta,
  socketB: WebSocket,
  metaB: RandomUserMeta,
) {
  randomPairs.set(socketA, socketB);
  randomPairs.set(socketB, socketA);
  randomMeta.set(socketA, metaA);
  randomMeta.set(socketB, metaB);

  sendJson(socketA, {
    type: "random:matched",
    partnerName: metaB.username,
  });
  sendJson(socketB, {
    type: "random:matched",
    partnerName: metaA.username,
  });

  console.log(`[Random] Matched ${metaA.username} with ${metaB.username}`);
}

/**
 * Clean up a random chat pair. Notify the partner.
 * Partner is NOT re-queued — they must click "Find New" to get a fresh socket.
 */

export async function cleanupRandomuser(socket: WebSocket) {
  const partner = randomPairs.get(socket);
  const meta = randomMeta.get(socket);

  if (partner) {
    // Notify the partner that this user has left
    sendJson(partner, {
      type: "random:partner_left",
    });

    // cleaning up both sides of pair
    randomPairs.delete(socket);
    randomPairs.delete(partner);
    randomMeta.delete(socket);
    // Keep partner's meta so they can still "Find New" cleanly
  } else {
    randomMeta.delete(socket);
  }

  // If this user was waiting in queue, remove them
  // Only remove if the stored socket matches THIS socket (avoid removing a newer socket's entry)
  if (meta) {
    const storedSocket = waitingUsers.get(meta.userId);
    if (storedSocket === socket) {
      waitingUsers.delete(meta.userId);
    }

    try {
      await redis.lrem(
        RANDOM_QUEUE_KEY,
        0,
        JSON.stringify({
          userId: meta.userId,
          username: meta.username,
        }),
      );
    } catch (error: unknown) {
      console.error("[Random] Error removing from queue:", error);
    }
  }
}

