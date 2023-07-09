import { type Express } from 'express';
import swaggerUI from 'swagger-ui-express';
import swaggerDocument from '../swagger.json';

/* Register a route for swagger doc */
export const registerSwaggerRoutes = (app: Express): void => {
  app.use('/swagger', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
};
