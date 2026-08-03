/*
  Warnings:

  - You are about to drop the column `image` on the `user` table. All the data in the column will be lost.
  - Added the required column `avatarBackgroundColor` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avatarSeed` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avatarStyle` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AvatarStyle" AS ENUM ('TOON_HEAD', 'NOTIONISTS_NEUTRAL', 'PERSONAS', 'ADVENTURER_NEUTRAL', 'THUMBS');

-- AlterTable
ALTER TABLE "user" DROP COLUMN "image",
ADD COLUMN     "avatarBackgroundColor" TEXT NOT NULL,
ADD COLUMN     "avatarSeed" TEXT NOT NULL,
ADD COLUMN     "avatarStyle" "AvatarStyle" NOT NULL,
ADD COLUMN     "avatarVersion" TEXT NOT NULL DEFAULT '10.x';

-- CreateTable
CREATE TABLE "AvatarHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "style" "AvatarStyle" NOT NULL,
    "seed" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvatarHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AvatarHistory_userId_idx" ON "AvatarHistory"("userId");

-- AddForeignKey
ALTER TABLE "AvatarHistory" ADD CONSTRAINT "AvatarHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
