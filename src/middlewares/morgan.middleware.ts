import morgan, { type StreamOptions } from 'morgan';
import logger from '../utils/logger.js';
import { SERVER_ENV } from '../utils/config.js';

morgan.token('body', (req: any) => {
  if (req.body && Object.keys(req.body).length > 0) {
    // CLAVE: Filtramos datos sensibles
    const bodyClone = { ...req.body };
    const sensitiveFields = ['password', 'token', 'credit_card'];
    
    sensitiveFields.forEach(field => {
      if (bodyClone[field]) bodyClone[field] = '******';
    });

    return `\n  Body: ${JSON.stringify(bodyClone, null, 2)}`;
  }
  return '';
});

// Conectamos el "stream" de Morgan con nuestro logger de Winston
const stream: StreamOptions = {
  write: (message) => logger.http(message.trim()),
};

const format = SERVER_ENV === 'debug' 
  ? ':method :url :status - :response-time ms :body' 
  : ':method :url :status - :response-time ms';

// Formato de log personalizado (puedes usar 'dev', 'combined', o un string)
const morganMiddleware = morgan(
  format,
  { stream }
);

export default morganMiddleware;