import winston from "winston";
import morgan from "morgan";

const { combine, timestamp, prettyPrint } = winston.format;
export const logger = winston.createLogger({
  level: "http",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    prettyPrint({
      colorize: true,
    })
  ),
  transports: [new winston.transports.Console()],
});
export const morganMiddleware = morgan(
  ":method :status :url - :response-time ms",
  {
    stream: {
      write: (message) => {
        // TODO: colorize based on status code
        return logger.http(message);
      },
    },
  }
);
