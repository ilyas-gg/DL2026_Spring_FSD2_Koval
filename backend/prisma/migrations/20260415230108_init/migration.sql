-- CreateTable
CREATE TABLE "Meme" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "weatherCategory" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Meme_pkey" PRIMARY KEY ("id")
);
