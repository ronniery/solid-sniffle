import express, { type Express } from 'express';
import errorHandler from '../utils/error.handler';

type TestRoutes = (server: Express) => void;

const createTestHost = async (routes: TestRoutes): Promise<Express> => {
  const server: Express = express();

  // Configuring express app
  server.use(express.json());

  // Load the test routes
  routes(server);

  // Global error handler
  server.use(errorHandler)

  // Return server instance
  return server;
};

export { createTestHost };
