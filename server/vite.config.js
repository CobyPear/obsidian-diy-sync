import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

export default defineConfig({
	test: {
		globals: true,
		environment: 'obsync',
		setupFiles: ['./__tests__/setupDb.ts'],
	},
});
