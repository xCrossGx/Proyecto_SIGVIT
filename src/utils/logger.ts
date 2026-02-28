import { createLogger, format, transports, addColors } from 'winston';
import { SERVER_ENV } from './config.js';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Lógica de nivel de log según tu petición:
// - Despliegue (production): Solo info hacia arriba (no debug)
// - Development: info y http
// - Debug: todo, incluyendo debug
const getLevel = () => {
  if (SERVER_ENV === 'development') return 'http';
  if (SERVER_ENV === 'debug') return 'debug'; // Si lanzas con NODE_ENV=debug
  return 'info'; // Por defecto para production
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
addColors(colors);

const logger = createLogger({
    level: getLevel(),
    levels,
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize({ all: true }),
                format.timestamp({ format: 'HH:mm:ss' }),
                format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
            ),
        }),
        new transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            format: format.combine(format.timestamp(), format.json()) 
        }),
        new transports.File({ 
            filename: 'logs/combined.log',
            format: format.combine(format.timestamp(), format.json())
        }),
    ],
});

export default logger;