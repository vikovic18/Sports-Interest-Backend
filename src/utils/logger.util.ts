import winston, { format } from "winston";

const { colorize, combine, timestamp, printf, splat } = format;

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: combine(
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss"
        }),
        printf((msg) => {
          return `${msg.timestamp} [${msg.level.toUpperCase().padStart(7)}]: ${msg.message}`;
        }),
        splat(),
        colorize({}),
      ),
    }),
  ],
});

export default logger;
