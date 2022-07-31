"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./utils/logger");
const routes_1 = require("./routes");
dotenv_1.default.config();
exports.app = (0, express_1.default)();
const port = process.env.PORT || 8080;
const host = process.env.HOST || "localhost";
exports.app.use(logger_1.morganMiddleware);
exports.app.use('/api', routes_1.routes);
exports.app.get("/", (req, res) => {
    res.json({ hello: "worlds" });
});
exports.app.listen(port, () => {
    console.log(`🌎 Server listening at http://${host}:${port}`);
});
