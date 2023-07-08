import { type Express } from 'express';
import healthCheck from 'express-healthcheck';

/* Register a route for health checking */
export const registerHealthRoutes = (app: Express): void => {
  app.get('/health', healthCheck());
};
