import express from "express";
import dotenv from "dotenv";
import cors from 'cors'
import type { CorsOptions } from "cors";

import { morganMiddleware } from "./utils/logger";
import { routes } from './routes'
dotenv.config();
export const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || "localhost";

const corsOptions: CorsOptions = {
    allowedHeaders: [
        "Origin",
        "Content-Type",
    ],
    methods: 'GET,OPTIONS,POST,PUT'
}
app.use(express.json())
app.use(cors(corsOptions))
app.use(morganMiddleware)
// app.use(cors())

app.use('/api', routes)
// app.get("/", (req, res) => {
//     res.json({ hello: "worlds" });
// });



app.listen(port, () => {
    console.log(`🌎 Server listening at http://${host}:${port}`);
});
