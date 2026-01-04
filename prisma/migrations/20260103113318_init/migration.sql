/*
  Warnings:

  - The primary key for the `ClassSession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bookingId51` on the `ClassSession` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `ClassSession` table. All the data in the column will be lost.
  - You are about to drop the column `isEvaluated` on the `ClassSession` table. All the data in the column will be lost.
  - You are about to drop the column `startTimeBJ` on the `ClassSession` table. All the data in the column will be lost.
  - You are about to drop the column `startTimeSaudi` on the `ClassSession` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ClassSession` table. All the data in the column will be lost.
  - You are about to drop the column `studentName` on the `ClassSession` table. All the data in the column will be lost.
  - You are about to drop the column `questionsSchema` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `themeColor` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `track` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `aiComment` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `expireAt` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `finalComment` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `shareToken` on the `Report` table. All the data in the column will be lost.
  - Added the required column `_id` to the `ClassSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classTimeSaudi` to the `ClassSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalStudentName` to the `ClassSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualStudentName` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feedback` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClassSession" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "courseName" TEXT NOT NULL,
    "bookingType" TEXT,
    "excelStatus" TEXT,
    "classTimeBJ" TEXT,
    "classTimeSaudi" DATETIME NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "originalStudentName" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "talk51Id" TEXT,
    "merithubId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ClassSession" ("bookingType", "courseName", "createdAt", "studentId", "teacherId", "teacherName", "updatedAt") SELECT "bookingType", "courseName", "createdAt", "studentId", "teacherId", "teacherName", "updatedAt" FROM "ClassSession";
DROP TABLE "ClassSession";
ALTER TABLE "new_ClassSession" RENAME TO "ClassSession";
CREATE TABLE "new_Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Material" ("id", "name") SELECT "id", "name" FROM "Material";
DROP TABLE "Material";
ALTER TABLE "new_Material" RENAME TO "Material";
CREATE UNIQUE INDEX "Material_name_key" ON "Material"("name");
CREATE TABLE "new_Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "actualStudentName" TEXT NOT NULL,
    "materialId" TEXT,
    "fallbackMaterialName" TEXT,
    "scores" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassSession" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Report_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Report" ("createdAt", "id", "materialId", "scores", "sessionId") SELECT "createdAt", "id", "materialId", "scores", "sessionId" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
CREATE UNIQUE INDEX "Report_sessionId_key" ON "Report"("sessionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
