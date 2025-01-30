import type { Request, Response } from 'express';
import type { Vault } from '../types';
import { orm } from '../db/orm';
import { createOrUpdateNodes } from '../utils/createOrUpdateNodes';
import { randomUUID } from 'node:crypto';

const vaultStmnt = orm.getNodesOnVault();

export const vaultControllers = {
	get: async (req: Request, res: Response) => {
		const vault = req.query.vault as string;
		const errorMessage = `No vault ${vault} to send. Check the vault name and make sure you've sync'd at least once.`;
		if (!vault) {
			res.status(400).json({
				error:
					'No vault was sent in the request. Make sure the Vault is set in the plugin options',
			});
			return;
		}
		if (!req.user) {
			res.status(401).json({ message: 'Please login' });
			return;
		}
		try {
			// get vault from DB
			const nodesFromVault = vaultStmnt.all({
				vault,
				username: req.user.username,
			});
			if (!nodesFromVault.length) {
				res.status(404).json({
					error: errorMessage,
				});
				return;
			}
			res.json({
				name: vault,
				nodes: nodesFromVault,
			});
			return;
		} catch (error) {
			console.error(error);
			res.status(500).json({
				error: errorMessage,
			});
			return;
		}
	},
	put: async (req: Request, res: Response) => {
		try {
			const {
				body: { nodes, vault },
			} = req;
			let resultVault;
			if (!vault) {
				res.status(400).json({ error: 'No vault was received' });
			}
			if (!req.user) {
				res.status(401).json({ message: 'Please login' });
			} else if (nodes && vault) {
				const foundVault = vaultStmnt.all({
					vault,
					username: req.user.username,
				});

				let vaultId: Vault['id'];

				if (foundVault.length > 0) {
					console.log(`Found vault ${vault} Adding nodes...`);
					vaultId = foundVault[0].vault_id;
				} else {
					const newVaultStmnt = orm.createVault();
					vaultId = randomUUID();
					newVaultStmnt.run({
						id: vaultId,
						name: vault,
						user: req.user.username,
					});
				}
				resultVault = await createOrUpdateNodes({
					nodes,
					vaultId,
				});

				res.json({
					message: `Vault ${vault} was successfully sync'd!`,
					vault: resultVault,
				});
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({
				message: 'Something went wrong',
				error: error,
			});
			return;
		}
	},
};
