import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import type { Environment, EnvironmentOptions } from 'vitest';

const __dirname = process.cwd();

export default <Environment>{
	name: 'obsync',
	async setup(global, options: EnvironmentOptions) {
		const dbName = `test_db_${uuid()}.db`;
		const dbPath = path.join(__dirname, dbName);
		const DATABASE_URL = `file:../${dbName}`;

		global.process.env.DATABASE_URL = DATABASE_URL;
		return {
			async teardown() {
				await fs.promises.unlink(dbPath);
			},
		};
	},
};
