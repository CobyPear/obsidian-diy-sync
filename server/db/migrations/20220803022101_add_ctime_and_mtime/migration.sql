/*
  Warnings:

  - Added the required column `ctime` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mtime` to the `Node` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Node" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vaultId" INTEGER,
    "content" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "ctime" BIGINT NOT NULL,
    "mtime" BIGINT NOT NULL,
    CONSTRAINT "Node_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Node" ("content", "extension", "id", "name", "path", "vaultId") SELECT "content", "extension", "id", "name", "path", "vaultId" FROM "Node";
DROP TABLE "Node";
ALTER TABLE "new_Node" RENAME TO "Node";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
