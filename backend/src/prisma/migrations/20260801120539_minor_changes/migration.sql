/*
  Warnings:

  - You are about to drop the column `isOnline` on the `user` table. All the data in the column will be lost.
  - The `avatarStyle` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `style` on the `AvatarHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "AvatarHistory" DROP COLUMN "style",
ADD COLUMN     "style" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "isOnline",
ADD COLUMN     "name" TEXT,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "avatarBackgroundColor" DROP NOT NULL,
ALTER COLUMN "avatarSeed" DROP NOT NULL,
DROP COLUMN "avatarStyle",
ADD COLUMN     "avatarStyle" TEXT;

-- DropEnum
DROP TYPE "AvatarStyle";
