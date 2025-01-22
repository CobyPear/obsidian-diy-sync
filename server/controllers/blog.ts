import type { Request, Response } from 'express';
import type { Node } from '../types';
import { db } from '../db';
import { LOCALE } from '../utils/consts';

export const blogControllers = {
	get: async (req: Request, res: Response) => {
		const { vault } = req.query;
		if (!vault) {
			return res.status(400).json({
				message:
					'No vault name provided.\nThe vault name should be available as a query string parameter vault=vaultName ',
			});
		}

		try {
			const stmnt = db.prepare<unknown[], Node>(`
Select Node.*
  FROM Node
  JOIN Vault ON Node.vaultId = Vault.id
  WHERE Vault.name=@vault;
`);
			const vaultFromDb = stmnt.all({ vault: vault as string });
			console.log(vaultFromDb);

			if (!vaultFromDb) {
				return res.status(404).json({
					message: `Vault named ${vault} was not found in the DB. Please make sure the vault exists in the database`,
				});
			}

			const publishedNodes = vaultFromDb
				.filter(({ content }: Node) => {
					return (
						content.includes('published: true') ||
						content.includes('#published') ||
						content.includes('#unpublished') ||
						content.includes('#deleted')
					);
				})
				.map(({ name, content, ctime, mtime }: Node) => {
					const title = name.replace(/\.md$/g, '');
					const slug = title.replace(/\s/g, '-').toLowerCase();
					const createdAt = new Date(Number(ctime)).toLocaleDateString(LOCALE);
					const modifiedAt = new Date(Number(mtime)).toLocaleDateString(LOCALE);

					content = content.replace('#published', '');
					return {
						title,
						slug,
						content,
						createdAt,
						modifiedAt,
					};
				});

			if (!publishedNodes) {
				return res.status(404).json({
					message: `Vault ${vault} has not published nodes. Please publish a node and try again.`,
				});
			}

			res.status(200).json(publishedNodes);
		} catch (error) {
			console.error(error);
			return res.status(500).json({
				message:
					error instanceof Error
						? error.message
						: 'Something went wrong on the server',
				error: error,
			});
		}
	},
};
