import type { Node, Vault } from '../types';
import { db } from '../db';
import { randomUUID } from 'node:crypto';

export const createOrUpdateNodes = async ({
	nodes,
	vaultId,
}: {
	nodes: Node[];
	vaultId: Vault['id'];
}) => {
	for (const { content, name, extension, path, ctime, mtime } of nodes) {
		try {
			const upsertStmnt = db.prepare(
				`
INSERT INTO Node (id, path, content, name, extension, ctime, mtime, vaultId)
  VALUES (@id, @path, @content, @name, @extension, @ctime, @mtime, @vaultId)
  ON CONFLICT(path)
  DO UPDATE SET
    content = excluded.content,
    name = excluded.name,
    path = excluded.path,
    extension = excluded.extension,
    ctime = excluded.ctime,
    mtime = excluded.mtime,
    vaultId = excluded.vaultId;
`,
			);
			upsertStmnt.run({
				id: randomUUID(),
				path,
				content,
				name,
				extension,
				ctime,
				mtime,
				vaultId,
			});
		} catch (error) {
			console.error(error);
			return;
		}
	}

	const vaultStmnt = db.prepare<unknown[], Vault>(`
SELECT v.id, v.name, v.user, v.createdAt, n.id AS node_id, n.name AS node_name
  FROM Vault v
  LEFT JOIN Node n ON n.vaultId = v.id
  WHERE v.id = @id
  LIMIT 1;
`);

	const vault = vaultStmnt.get({
		id: vaultId,
	});
	return vault;
	// return await prisma.vault.findUnique({
	// 	where: {
	// 		id: vaultId,
	// 	},
	// 	include: {
	// 		nodes: true,
	// 	},
	// });
};
