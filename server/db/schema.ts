export class Schema {
	userTable() {
		return `CREATE TABLE IF NOT EXISTS "User" (
		"id" TEXT NOT NULL PRIMARY KEY,
		"username" TEXT NOT NULL,
		"password" TEXT NOT NULL,
		"refreshToken" TEXT
		);`;
	}
	vaultTable() {
		return `CREATE TABLE IF NOT EXISTS "Vault" (
		"id" TEXT NOT NULL PRIMARY KEY,
		"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		"name" TEXT NOT NULL,
		"user" TEXT NOT NULL,
		CONSTRAINT "Vault_user_fkey" FOREIGN KEY ("user") REFERENCES "User" ("username") ON DELETE CASCADE ON UPDATE CASCADE
		);`;
	}

	nodeTable() {
		return `CREATE TABLE IF NOT EXISTS "Node" (
		"id" TEXT NOT NULL,
		"vaultId" TEXT NOT NULL,
		"content" TEXT NOT NULL,
		"extension" TEXT NOT NULL,
		"name" TEXT NOT NULL,
		"path" TEXT NOT NULL,
		"ctime" TEXT NOT NULL,
		"mtime" TEXT NOT NULL,
		CONSTRAINT "Node_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
		PRIMARY KEY("id", "vaultId")
);`;
	}
	usernameIndex() {
		return `CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");`;
	}

	vaultNodeIndex() {
		return `CREATE UNIQUE INDEX IF NOT EXISTS "Node_id_vault_key" ON "Node"("id", "vaultId");`;
	}
}
