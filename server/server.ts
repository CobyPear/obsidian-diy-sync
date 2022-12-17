import type { CorsOptions } from "cors";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { morganMiddleware } from "./utils/logger";
import { routes } from "./routes";

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || "localhost";

const corsOptions: CorsOptions = {
  allowedHeaders: ["Origin", "Content-Type", "Set-Cookie"],
  methods: "GET,OPTIONS,POST,PUT,DELETE",
  origin: process.env.ORIGIN || "app://obsidian.md",
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(morganMiddleware);

app.use("/api", routes);
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(port, () => {
  console.log(`🌎 Server listening at http://${host}:${port}`);
});

export default app;
