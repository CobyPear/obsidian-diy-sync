import { prisma } from '../db';
import type { Node } from '@prisma/client';
import type { Request, Response } from 'express';

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
			const vaultFromDb = await prisma.vault.findFirst({
				where: {
					name: vault as string,
				},
				include: {
					nodes: true,
				},
			});

			if (!vaultFromDb) {
				return res.status(404).json({
					message: `Vault named ${vault} was not found in the DB. Please make sure the vault exists in the database`,
				});
			}

			const publishedNodes = vaultFromDb?.nodes
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
					const createdAt = new Date(Number(ctime)).toLocaleDateString('en-US');
					const modifiedAt = new Date(Number(mtime)).toLocaleDateString(
						'en-US',
					);

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
