/*
  Warnings:

  - You are about to drop the column `tags` on the `ExternalApps` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ExternalApps" DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "AppTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AppTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AppTagToExternalApps" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AppTagToExternalApps_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppTag_name_key" ON "AppTag"("name");

-- CreateIndex
CREATE INDEX "_AppTagToExternalApps_B_index" ON "_AppTagToExternalApps"("B");

-- AddForeignKey
ALTER TABLE "_AppTagToExternalApps" ADD CONSTRAINT "_AppTagToExternalApps_A_fkey" FOREIGN KEY ("A") REFERENCES "AppTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppTagToExternalApps" ADD CONSTRAINT "_AppTagToExternalApps_B_fkey" FOREIGN KEY ("B") REFERENCES "ExternalApps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
