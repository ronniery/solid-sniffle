import 'dotenv-defaults/config';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import errorHandler from './utils/error.handler';
import ticketRoutes from './routes/ticket.route';
import healthRoutes from './routes/health.route';

const { APP_PORT = '3000' } = process.env;

const start = async () => {
  try {
    // Creating the mongoDB memory server
    const mongoServer = await MongoMemoryServer.create();

    // Connecting to the mongoDB memory server using mongoose
    await mongoose.connect(mongoServer.getUri(), { dbName: 'notificationsDB' });

    // Creating the express app
    const app = express();
    app.use(express.json());

    // Register a health check route, to be used inside docker
    healthRoutes(app);

    // Registering all app routes
    ticketRoutes(app);

    // Register the error handler
    app.use(errorHandler);

    // Starting the server
    await new Promise<void>((resolve, reject) => {
      app.listen(Number(APP_PORT), resolve).on('error', reject);
    });

    console.log(`Server started at http://localhost:${APP_PORT}`);
  } catch (error: unknown) {
    console.log(error);
    process.exit(1);
  }
};

process.on('beforeExit', async () => {
  await mongoose.disconnect();
  console.log('mongoose disconnected');
});

if (require.main === module) {
  start();
}

export { start };
