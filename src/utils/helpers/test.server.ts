import express, { type Express } from 'express';
import errorHandler from '../error.handler';
import { isEmpty } from 'lodash';

type TestRoutes = (server: Express) => void;

const createTestHost = async (routes?: TestRoutes): Promise<Express> => {
  const server: Express = express();

  // Configuring express app
  server.use(express.json());

  if (!isEmpty(routes)) {
    // Load the test routes
    routes(server);
  }

  // Global error handler
  server.use(errorHandler);

  // Return server instance
  return server;
};

export { createTestHost };
