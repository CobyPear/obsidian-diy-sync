import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || "localhost";

app.get("/", (req, res) => {
    res.json({ hello: "worlds" });
});

app.listen(port, () => {
    console.log(`🌎 Server listening at http://${host}:${port}`);
});
