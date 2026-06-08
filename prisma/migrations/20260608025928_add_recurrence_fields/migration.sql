-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "failureReason" TEXT,
    "dueDate" DATETIME,
    "reminder" DATETIME,
    "completedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PROCESS',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "recurrence" TEXT NOT NULL DEFAULT 'NONE',
    "recurrenceEnd" DATETIME,
    "parentTaskId" INTEGER,
    "userId" INTEGER NOT NULL,
    "categoryId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TaskCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("categoryId", "completedAt", "createdAt", "description", "dueDate", "failureReason", "id", "priority", "reminder", "status", "title", "updatedAt", "userId") SELECT "categoryId", "completedAt", "createdAt", "description", "dueDate", "failureReason", "id", "priority", "reminder", "status", "title", "updatedAt", "userId" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
