import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "obsync",
    environmentOptions: {
      schemaPath: "./db/schema.prisma",
    },
    setupFiles: ["./__tests__/setupDb.ts"],
  },
});
