import winston, { format } from "winston";

const formatLog =  format.printf(
  ({ level, message, module='dvr', timestamp }) => `${timestamp} [${module}:${level}] ${message}`
);

export const rootLogger = winston.createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    formatLog
  ),
  transports: [
    new winston.transports.Console()
  ]
});
