import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import type { Environment, EnvironmentOptions } from 'vitest';
import { execSync } from 'child_process';

const __dirname = process.cwd();

type ObsyncOptions = EnvironmentOptions & {
	schemaPath?: string;
};

export default <Environment>{
	name: 'obsync',
	async setup(global, options: ObsyncOptions) {
		const dbName = `test_db_${uuid()}.db`;
		const dbPath = path.join(__dirname, dbName);
		const DATABASE_URL = `file:../${dbName}`;

		global.process.env.DATABASE_URL = DATABASE_URL;

		const schemaPath = options.schemaPath
			? options.schemaPath
			: './schema.prisma';
		// create the test_db file
		fs.openSync(dbPath, 'w');
		// sync the db schema
		execSync(`pnpm prisma db push --schema=${schemaPath}`);
		return {
			async teardown() {
				await fs.promises.unlink(dbPath);
			},
		};
	},
};
