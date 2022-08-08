import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import type { CorsOptions } from "cors";

import { morganMiddleware } from "./utils/logger";
import { routes } from "./routes";
dotenv.config();
export const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || "localhost";

const corsOptions: CorsOptions = {
  allowedHeaders: ["Origin", "Content-Type"],
  methods: "GET,OPTIONS,POST,PUT",
  origin: process.env.HOST || "app://obsidian.md"
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
