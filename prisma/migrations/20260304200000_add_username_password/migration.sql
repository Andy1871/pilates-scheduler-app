-- AlterTable
ALTER TABLE "User" ADD COLUMN "password" TEXT,
ADD COLUMN "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
