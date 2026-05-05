-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "task_name" TEXT NOT NULL,
    "time_needed" INTEGER NOT NULL,
    "complexity" INTEGER NOT NULL,
    "check" BOOLEAN NOT NULL
);
