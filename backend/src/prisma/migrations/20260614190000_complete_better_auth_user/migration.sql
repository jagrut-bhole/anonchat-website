-- Add the Better Auth core user fields while preserving any existing local users.
ALTER TABLE "user"
ADD COLUMN "name" TEXT,
ADD COLUMN "email" TEXT,
ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "image" TEXT,
ADD COLUMN "displayUsername" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "user"
SET
  "name" = COALESCE("username", 'Anonymous'),
  "email" = "id" || '@legacy.invalid';

ALTER TABLE "user"
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "username" DROP NOT NULL,
DROP COLUMN "password";

CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
