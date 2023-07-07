import express, { type Express } from 'express';

type TestRoutes = (server: Express) => void;

const createTestHost = async (routes: TestRoutes): Promise<Express> => {
  const server: Express = express();

  // Configuring express app
  server.use(express.json());

  // Load the test routes
  routes(server);

  // Return server instance
  return server;
};

export { createTestHost };
