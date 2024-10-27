import type { Request, Response } from 'express';
import type { Vault } from '@prisma/client';
import { prisma } from '../db';
import { createOrUpdateNodes } from '../utils/createOrUpdateNodes';
export const vaultControllers = {
	get: async (req: Request, res: Response) => {
		const vault = req.query.vault as string;
		const errorMessage = `No vault ${vault} to send. Check the vault name and make sure you've sync'd at least once.`;
		if (!vault) {
			return res.status(400).json({
				error:
					'No vault was sent in the request. Make sure the Vault is set in the plugin options',
			});
		}
		if (!req.user) {
			return res.status(401).json({ message: 'Please login' });
		}
		try {
			// get vault from DB
			// send it!
			const vaultsFromDB = await prisma.vault.findFirst({
				where: { name: vault, user: req.user.username },
				include: { nodes: true },
			});
			if (!vaultsFromDB) {
				return res.status(404).json({
					error: errorMessage,
				});
			}
			return res.json(vaultsFromDB);
		} catch (error) {
			console.error(error);
			return res.status(500).json({
				error: errorMessage,
			});
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
				const foundVault = await prisma.vault.findFirst({
					where: {
						name: vault,
						user: req.user.username,
					},
					include: {
						nodes: true,
					},
				});

				let vaultId: Vault['id'];

				if (foundVault) {
					console.log(`Found vault ${vault} Adding nodes...`);
					vaultId = foundVault.id;
				} else {
					const newVault = await prisma.vault.create({
						data: {
							name: vault,
							user: req.user.username,
						},
					});
					vaultId = newVault.id;
				}
				resultVault = await createOrUpdateNodes({
					nodes,
					vaultId: vaultId,
				});

				res.json({
					message: `Vault ${vault} was successfully sync'd!`,
					vault: resultVault,
				});
			}
		} catch (error) {
			console.error(error);
			return res.status(500).json({
				message: 'Something went wrong',
				error: error,
			});
		}
	},
};
