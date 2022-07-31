"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganMiddleware = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const morgan_1 = __importDefault(require("morgan"));
const { combine, timestamp, prettyPrint } = winston_1.default.format;
exports.logger = winston_1.default.createLogger({
    level: "http",
    format: combine(timestamp({
        format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }), prettyPrint({
        colorize: true,
    })),
    transports: [new winston_1.default.transports.Console()],
});
exports.morganMiddleware = (0, morgan_1.default)(":method :status :url - :response-time ms", {
    stream: {
        write: (message) => {
            // TODO: colorize based on status code
            return exports.logger.http(message);
        },
    },
});
