/*
  Warnings:

  - Added the required column `name` to the `CartDrawerSettings` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CartDrawerSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "settings" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_CartDrawerSettings" ("createdAt", "id", "settings", "shop", "updatedAt") SELECT "createdAt", "id", "settings", "shop", "updatedAt" FROM "CartDrawerSettings";
DROP TABLE "CartDrawerSettings";
ALTER TABLE "new_CartDrawerSettings" RENAME TO "CartDrawerSettings";
CREATE UNIQUE INDEX "CartDrawerSettings_shop_name_key" ON "CartDrawerSettings"("shop", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
