import request from 'supertest';
import app from '../server';
import { db } from '../db/index';
import { afterAll, beforeAll, vi } from 'vitest';
import { rmSync, statSync } from 'node:fs';

export const server = request.agent(app);

beforeAll(() => {
	process.env.TEST_ENV = 'true';
	process.env.JWT_REFRESH_SECRET = 'test_Refresh';
	process.env.JWT_ACCESS_SECRET = 'test_Access';
});

afterAll(async () => {
	db.close();
});
