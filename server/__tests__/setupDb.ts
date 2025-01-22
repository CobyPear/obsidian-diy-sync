import request from 'supertest';
import app from '../server';
import { db } from '../db/index';
import { afterAll } from 'vitest';
import { rmSync, statSync } from 'node:fs';

export const server = request.agent(app);

// export const prisma = new PrismaClient({
// 	datasources: {
// 		db: {
// 			url: process.env.DATABASE_URL,
// 		},
// 	},
// });

process.env.TEST_ENV = 'true';
process.env.JWT_REFRESH_SECRET = 'test_Refresh';
process.env.JWT_ACCESS_SECRET = 'test_Access';

afterAll(async () => {
	db.close();
	if (statSync(process.cwd() + process.env.DATABASE_URL)) {
		rmSync(process.cwd() + process.env.DATABASE_URL);
	}
});
