import express from "express";
import dotenv from "dotenv";

import { morganMiddleware } from "./utils/logger";
import { routes } from './routes'

dotenv.config();
export const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || "localhost";

app.use(morganMiddleware)


app.use('/api', routes)
app.get("/", (req, res) => {
    res.json({ hello: "worlds" });
});



app.listen(port, () => {
    console.log(`🌎 Server listening at http://${host}:${port}`);
});
