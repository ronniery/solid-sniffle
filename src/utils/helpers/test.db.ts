import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { isEmpty } from 'lodash';

let storage: MongoMemoryServer;

export const connect = async (): Promise<typeof mongoose> => {
  storage = await MongoMemoryServer.create();

  return await mongoose.connect(storage.getUri(), {
    dbName: 'jestTest',
  });
};

export const disconnect = async (): Promise<void> => {
  if (!isEmpty(storage)) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await storage.stop();
  }
};

export const dropCollections = async (): Promise<void> => {
  if (!isEmpty(storage)) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.drop();
    }
  }
};
