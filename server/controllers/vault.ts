import type { Request, Response } from 'express';
import type { Vault, Node } from '../types';
import { db } from '../db';
import { createOrUpdateNodes } from '../utils/createOrUpdateNodes';
import { randomUUID } from 'node:crypto';

const vaultStmnt = db.prepare<unknown[], Vault & Node & { vault_id: string }>(`
SELECT Vault.id as vault_id, Node.*
  FROM Vault
  LEFT JOIN Node ON Node.vaultId = Vault.id
  WHERE Vault.name=@vault AND Vault.user=@username
`);
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
			if (!nodesFromVault) {
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
					console.debug(foundVault.length, foundVault[0]);
					console.log(`Found vault ${vault} Adding nodes...`);
					vaultId = foundVault[0].vault_id;
					console.debug('vault ID from found vault: ', foundVault[0]?.vaultId);
				} else {
					const newVaultStmnt = db.prepare<unknown[], Vault>(`
INSERT INTO Vault (id, name, user)
  VALUES (@id, @name, @user);
`);
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
