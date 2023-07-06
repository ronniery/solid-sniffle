import { Express } from 'express';
import healthCheck from 'express-healthcheck';

/* Register a route for health checking */
export default (app: Express): void => {
  app.get('/health', healthCheck());
};
