import { db } from '.';
import type { Node, User, Vault } from '../types';

class ORM {
	db = db;

	getNodes() {
		const query = `
			Select Node.*
			FROM Node
			JOIN Vault ON Node.vaultId = Vault.id
			WHERE Vault.name=@vault;`;

		return this.db.prepare<unknown[], Node>(query);
	}

	getUser(...fields: string[]) {
		const query = `
			SELECT id, username ${fields && fields.length > 0 ? `, ${fields.join(', ')}` : ''}
			FROM User
			WHERE username = @username;`;

		return this.db.prepare<unknown[], User>(query);
	}

	/**
	 * updates the user refreshToken
	 */
	updateUser() {
		const query = `
			UPDATE User
			SET refreshToken = @refreshToken
			WHERE username = @username;`;

		return this.db.prepare<unknown[], User>(query);
	}

	createUser() {
		const query = `
			INSERT INTO User (id, username, password)
			VALUES (@id, @username, @password);`;

		return this.db.prepare<unknown[], User>(query);
	}

	deleteUser() {
		const query = `
			DELETE FROM user
			WHERE username=@username`;

		return this.db.prepare<unknown[], User>(query);
	}

	getNodesOnVault() {
		const query = `
			SELECT Vault.id as vault_id, Node.*
			FROM Vault
			LEFT JOIN Node ON Node.vaultId = Vault.id
			WHERE Vault.name=@vault AND Vault.user=@username;`;

		return this.db.prepare<unknown[], Vault & Node & { vault_id: string }>(
			query,
		);
	}

	getAllNodesOnVault() {
		const query = `
			SELECT v.id, v.name, v.user, v.createdAt, n.id AS node_id, n.name AS node_name
			FROM Vault v
			LEFT JOIN Node n ON n.vaultId = v.id
			WHERE v.id = @id
			LIMIT 1;`;

		return this.db.prepare<unknown[], Vault>(query);
	}

	createVault() {
		const query = `
			INSERT INTO Vault (id, name, user)
			VALUES (@id, @name, @user);`;

		return this.db.prepare<unknown[], Vault>(query);
	}

	getNode() {
		const query = `
		SELECT id, vaultId, content
		FROM Node
		WHERE Node.vaultId=@vaultId AND Node.path=@path;`;

		return this.db.prepare<unknown[], Node>(query);
	}

	updateNode() {
		const query = `
			UPDATE Node
				SET
					path=@path,
					content=@content,
					name=@name,
					extension=@extension,
					ctime=@ctime,
					mtime=@mtime
				WHERE id=@id AND vaultId=@vaultId;`;

		return this.db.prepare<unknown[], Node>(query);
	}

	createNode() {
		const query = `
			INSERT INTO Node (id, path, content, name, extension, ctime, mtime, vaultId)
			VALUES (@id, @path, @content, @name, @extension, @ctime, @mtime, @vaultId);`;

		return this.db.prepare(query);
	}
}

export const orm = new ORM();
