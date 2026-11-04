-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "availability" INTEGER[] DEFAULT ARRAY[4, 4, 4, 4, 4, 2, 2]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "hours" INTEGER NOT NULL,
    "complexity" INTEGER NOT NULL,
    "weekStart" DATE NOT NULL,
    "day" INTEGER,
    "actualHours" INTEGER,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Task_userId_weekStart_idx" ON "Task"("userId", "weekStart");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Domain rules enforced by the database as well as the API.
ALTER TABLE "Task" ADD CONSTRAINT "Task_hours_check" CHECK ("hours" BETWEEN 1 AND 12);
ALTER TABLE "Task" ADD CONSTRAINT "Task_complexity_check" CHECK ("complexity" BETWEEN 1 AND 5);
ALTER TABLE "Task" ADD CONSTRAINT "Task_actualHours_check" CHECK ("actualHours" IS NULL OR "actualHours" BETWEEN 1 AND 24);
ALTER TABLE "Task" ADD CONSTRAINT "Task_day_check" CHECK ("day" IS NULL OR "day" BETWEEN 0 AND 6);
