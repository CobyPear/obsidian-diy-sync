import type { Node, Vault } from '../types';
import { randomUUID } from 'node:crypto';
import { orm } from '../db/orm';

export const createOrUpdateNodes = async ({
	nodes,
	vaultId,
}: {
	nodes: Node[];
	vaultId: Vault['id'];
}) => {
	for (const { content, name, extension, path, ctime, mtime } of nodes) {
		try {
			const nodeStmnt = orm.getNode();
			const node = nodeStmnt.get({ vaultId, path });
			if (node?.content && node.id) {
				console.debug(`Found node ${path}... Updating!`);
				const updateStmnt = orm.updateNode();
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
				const insertStmnt = orm.createNode();
				insertStmnt.run({
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

	const vaultStmnt = orm.getAllNodesOnVault();

	const vault = vaultStmnt.get({
		id: vaultId,
	});
	return vault;
};
