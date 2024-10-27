import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import app from '../server';

export const server = request.agent(app);

export const prisma = new PrismaClient({
	datasources: {
		db: {
			url: process.env.DATABASE_URL,
		},
	},
});
process.env.TEST_ENV = 'true';
process.env.JWT_REFRESH_SECRET = 'test_Refresh';
process.env.JWT_ACCESS_SECRET = 'test_Access';

afterAll(async () => {
	await prisma.node.deleteMany();
	await prisma.vault.deleteMany();
	await prisma.user.deleteMany();
	await prisma.$disconnect();
});
