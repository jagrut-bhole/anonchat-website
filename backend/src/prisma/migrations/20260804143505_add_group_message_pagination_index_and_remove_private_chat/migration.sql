/*
  Warnings:

  - You are about to drop the `private_chats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `private_messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "private_chats" DROP CONSTRAINT "private_chats_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "private_chats" DROP CONSTRAINT "private_chats_user2Id_fkey";

-- DropForeignKey
ALTER TABLE "private_messages" DROP CONSTRAINT "private_messages_chatId_fkey";

-- DropForeignKey
ALTER TABLE "private_messages" DROP CONSTRAINT "private_messages_senderId_fkey";

-- DropIndex
DROP INDEX "group_messages_groupId_createdAt_idx";

-- DropTable
DROP TABLE "private_chats";

-- DropTable
DROP TABLE "private_messages";

-- CreateIndex
CREATE INDEX "group_messages_groupId_createdAt_id_idx" ON "group_messages"("groupId", "createdAt", "id");
