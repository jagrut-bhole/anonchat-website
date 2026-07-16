import dotenv from "dotenv";
dotenv.config();

import { WebSocketServer, WebSocket } from "ws";
import { redis } from "@/lib/redis/redis";
import { prisma } from "@/lib/prisma";
import type { IncomingMessage } from "./socket";
import type { ClientMeta } from "./socket";
import type { RandomUserMeta } from "./socket";
import {
  groupRooms,
  clientMeta,
  randomMeta,
  waitingUsers,
  RANDOM_QUEUE_KEY,
  pairUsers,
  randomPairs,
  cleanupRandomuser,
} from "./socket";
import { sendJson } from "./socket";

const PORT = Number(process.env.WS_PORT || 8080);
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (socket, request) => {
  const ip = request.socket.remoteAddress;
  console.log(`[WS] New Connection from ${ip}`);

  socket.on("message", async (rawData) => {
    try {
      const data: IncomingMessage = JSON.parse(rawData.toString());

      // ========================================
      // GROUP CHAT — join
      // ========================================

      if (data.type === "join") {
        if (!data.groupId || !data.userId || !data.username) {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "Missing joining fields",
            }),
          );
          return;
        }

        const meta: ClientMeta = {
          userId: data.userId,
          username: data.username,
          groupId: data.groupId,
        };

        clientMeta.set(socket, meta);

        if (!groupRooms.has(data.groupId)) {
          groupRooms.set(data.groupId, new Set());
        }
        groupRooms.get(data.groupId)!.add(socket);

        console.log(`[WS] User ${data.username} joined group ${data.groupId}`);

        socket.send(
          JSON.stringify({
            type: "joined",
            groupId: data.groupId,
          }),
        );
        return;
      }

      // ========================================
      // GROUP CHAT — message
      // ========================================

      if (data.type === "message") {
        const meta = clientMeta.get(socket);
        if (!meta) {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "You must join a group first",
            }),
          );
          return;
        }

        if (!data.content || !data.content.trim()) return;

        const content = data.content.trim();

        const savedMessage = await prisma.groupMessage.create({
          data: {
            groupId: meta.groupId,
            userId: meta.userId,
            content: content,
          },
        });

        const broadcastPayload = JSON.stringify({
          type: "new_message",
          message: {
            id: savedMessage.id,
            groupId: meta.groupId,
            userId: meta.userId,
            username: meta.username,
            content: content,
            createdAt: savedMessage.createdAt.toISOString(),
          },
        });

        const roomClients = groupRooms.get(meta.groupId);

        if (roomClients) {
          roomClients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcastPayload);
            }
          });
        }
        console.log(
          `[WS] Message from ${meta.username} in group ${meta.groupId}: ${content}`,
        );
        return;
      }

      // ========================================
      // RANDOM CHAT — random:join
      // ========================================

      if (data.type === "random:join") {
        if (!data.userId || !data.username) {
          sendJson(socket, {
            type: "error",
            message: "Missing userId or username",
          });
          return;
        }

        const myMeta: RandomUserMeta = {
          userId: data.userId,
          username: data.username,
        };

        // Store this socket's metadata immediately
        randomMeta.set(socket, myMeta);

        // Clean any stale entries for this userId before joining
        const oldSocket = waitingUsers.get(data.userId);
        if (oldSocket && oldSocket !== socket) {
          waitingUsers.delete(data.userId);
          console.log(
            `[Random] Cleaned stale waitingUsers entry for ${data.username}`,
          );
        }

        try {
          // Remove any stale Redis entries for this user
          await redis.lrem(RANDOM_QUEUE_KEY, 0, JSON.stringify(myMeta));
        } catch (error: unknown) {
          console.error("[Random] Error cleaning stale queue entries:", error);
        }

        try {
          // Try to pop someone from the queue
          const raw = await redis.rpop(RANDOM_QUEUE_KEY);
          if (raw) {
            // Parse the queued user data
            const queued: RandomUserMeta =
              typeof raw === "string"
                ? JSON.parse(raw)
                : (raw as RandomUserMeta);

            // Don't match with yourself
            if (queued.userId === data.userId) {
              // Put them back and add ourselves
              await redis.lpush(RANDOM_QUEUE_KEY, JSON.stringify(queued));
              await redis.lpush(RANDOM_QUEUE_KEY, JSON.stringify(myMeta));
              waitingUsers.set(data.userId, socket);
              sendJson(socket, {
                type: "random:waiting",
              });
              console.log(
                `[Random] ${data.username} joined queue (self-match avoided)`,
              );
              return;
            }

            // Check if the queued user's socket is still alive
            const partnerSocket = waitingUsers.get(queued.userId);
            if (partnerSocket && partnerSocket.readyState === WebSocket.OPEN) {
              // Match Found
              waitingUsers.delete(queued.userId);
              pairUsers(socket, myMeta, partnerSocket, queued);
            } else {
              // Stale entry — partner disconnected, try again recursively
              waitingUsers.delete(queued.userId);
              console.log(
                `[Random] Removed stale queue entry for ${queued.username}`,
              );

              // Try to pop another one
              const raw2 = await redis.rpop(RANDOM_QUEUE_KEY);
              if (raw2) {
                const queued2: RandomUserMeta =
                  typeof raw2 === "string"
                    ? JSON.parse(raw2)
                    : (raw2 as RandomUserMeta);

                if (queued.userId === data.userId) {
                  await redis.lpush(RANDOM_QUEUE_KEY, JSON.stringify(queued2));
                  await redis.lpush(RANDOM_QUEUE_KEY, JSON.stringify(myMeta));
                  waitingUsers.set(data.userId, socket);
                  sendJson(socket, {
                    type: "random:waiting",
                  });
                  return;
                }

                const partnerSocket2 = waitingUsers.get(queued2.userId);
                if (
                  partnerSocket2 &&
                  partnerSocket2.readyState === WebSocket.OPEN
                ) {
                  waitingUsers.delete(queued2.userId);
                  pairUsers(socket, myMeta, partnerSocket2, queued2);
                } else {
                  // No valid partner found, add self to queue
                  waitingUsers.delete(queued2.userId);
                  await redis.lpush(RANDOM_QUEUE_KEY, JSON.stringify(myMeta));
                  waitingUsers.set(data.userId, socket);
                  sendJson(socket, { type: "random:waiting" });
                  console.log(
                    `[Random] ${data.username} joined queue (no valid partners)`,
                  );
                }
              } else {
                // Queue is empty now, add self
                await redis.lpush(RANDOM_QUEUE_KEY, JSON.stringify(myMeta));
                waitingUsers.set(data.userId, socket);
                sendJson(socket, { type: "random:waiting" });
                console.log(`[Random] ${data.username} joined queue`);
              }
            }
          } else {
            // Queue is empty — add self
            await redis.lpush(RANDOM_QUEUE_KEY, JSON.stringify(myMeta));
            waitingUsers.set(data.userId, socket);
            sendJson(socket, { type: "random:waiting" });
            console.log(`[Random] ${data.username} joined queue (empty queue)`);
          }
        } catch (error: unknown) {
          console.error("[Random] Error during join:", error);
          sendJson(socket, {
            type: "error",
            message: "Failed to join random chat queue",
          });
        }
        return;
      }
      // ========================================
      // RANDOM CHAT — random:message
      // ========================================

      if (data.type === "random:message") {
        const partner = randomPairs.get(socket);
        if (!partner) {
          sendJson(socket, { type: "error", message: "Not in a random chat" });
          return;
        }

        if (!data.content || !data.content.trim()) return;

        sendJson(partner, {
          type: "random:new_message",
          content: data.content.trim(),
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // ========================================
      // RANDOM CHAT — random:typing
      // ========================================
      if (data.type === "random:typing") {
        const partner = randomPairs.get(socket);
        if (partner) {
          sendJson(partner, { type: "random:partner_typing" });
        }
        return;
      }

      // ========================================
      // RANDOM CHAT — random:stop_typing
      // ========================================
      if (data.type === "random:stop_typing") {
        const partner = randomPairs.get(socket);
        if (partner) {
          sendJson(partner, { type: "random:partner_stop_typing" });
        }
        return;
      }

      // ========================================
      // RANDOM CHAT — random:leave
      // ========================================

      if (data.type === "random:leave") {
        await cleanupRandomuser(socket);
        console.log(`[Random] User left chat`);
        return;
      }
    } catch (error: unknown) {
      console.error("[WS] Error processing message:", error);
      socket.send(
        JSON.stringify({ type: "error", message: "Invalid message format" }),
      );
    }
  });

  socket.on("error", (error) => {
    console.error(`[WS] Error from ${ip}: ${error.message}`);
  });

  socket.on("close", async () => {
    // Group chat Clenup
    const meta = clientMeta.get(socket);
    if (meta) {
      const room = groupRooms.get(meta.groupId);
      if (room) {
        room.delete(socket);
        if (room.size === 0) {
          groupRooms.delete(meta.groupId);
        }
      }
      console.log(`[WS] User ${meta.username} left group ${meta.groupId}`);
      clientMeta.delete(socket);
    }

    // Random chat cleanup
    await cleanupRandomuser(socket);
    console.log(`[WS] Connection closed from ${ip}`);
  });
});

console.log(`[WS] WebSocket server is running on ws://localhost:${PORT}`);