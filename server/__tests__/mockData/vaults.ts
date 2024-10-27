import { Prisma } from '@prisma/client';

export const vaults: Prisma.VaultCreateInput[] = [
	{
		name: 'TestingVault',
	},
	{
		name: 'test vault 2',
	},
];
