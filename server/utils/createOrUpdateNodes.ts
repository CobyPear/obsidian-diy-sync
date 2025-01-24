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
			const nodeStmnt = db.prepare<unknown[], Node>(
				`SELECT id, vaultId, content
						FROM Node
						WHERE Node.vaultId=@vaultId AND Node.path=@path`,
			);
			const node = nodeStmnt.get({ vaultId, path });
			console.log(node);
			if (node?.content && node.id) {
				console.debug('Found node... Updating!', node);

				const updateStmnt = db.prepare(
					`UPDATE Node
						SET
							path=@path,
							content=@content,
							name=@name,
							extension=@extension,
							ctime=@ctime,
							mtime=@mtime
						WHERE id=@id AND vaultId=@vaultId`,
				);
				updateStmnt.run({
					id: node.id,
					vaultId,
					path,
					content,
					name,
					extension,
					ctime,
					mtime,
				});
			} else {
				const upsertStmnt = db.prepare(
					`
INSERT INTO Node (id, path, content, name, extension, ctime, mtime, vaultId)
  VALUES (@id, @path, @content, @name, @extension, @ctime, @mtime, @vaultId)
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
			}
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
};
