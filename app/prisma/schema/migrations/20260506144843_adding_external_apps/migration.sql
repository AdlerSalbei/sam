-- CreateTable
CREATE TABLE "ExternalApps" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "imageSrc" TEXT,
    "tags" TEXT[],
    "url" TEXT NOT NULL,
    "team" TEXT[],

    CONSTRAINT "ExternalApps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalApps_slug_key" ON "ExternalApps"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalApps_url_key" ON "ExternalApps"("url");
