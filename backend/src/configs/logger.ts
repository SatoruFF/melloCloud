import winston from "winston";

let loggerSettings = winston.format.combine(
  winston.format.colorize({
    all: true,
  }),
  winston.format.label({
    label: "[WINSTON]",
  }),
  winston.format.timestamp({
    format: "YY-MM-DD HH:mm:ss",
  }),
  winston.format.printf((info) => {
    return `${info.label} ${info.timestamp} ${info.level} : ${info.message}${
      info.stack ? "\n" + info.stack : ""
    }`;
  }),
  winston.format.errors({ stack: true })
);

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "cyan",
  debug: "green",
});

// Создаем логгер
export const logger = winston.createLogger({
  level: "debug",
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), loggerSettings),
    }),
  ],
});
