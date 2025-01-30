import { Schema } from './schema';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
dotenv.config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
	throw new Error('DATABASE_URL not set.');
}

export const db = new Database(DB_URL);

const schema = new Schema();

const prepareTables = db.transaction(() => {
	db.prepare(schema.userTable()).run();
	db.prepare(schema.vaultTable()).run();
	db.prepare(schema.nodeTable()).run();
	db.prepare(schema.usernameIndex()).run();
	db.prepare(schema.vaultNodeIndex()).run();
});

prepareTables();
