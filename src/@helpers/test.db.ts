import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { isEmpty } from 'lodash';

let mongo: MongoMemoryServer;

export const connect = async (): Promise<typeof mongoose> => {
  mongo = await MongoMemoryServer.create();

  return await mongoose.connect(mongo.getUri(), {
    dbName: 'jestTest',
  });
};

export const disconnect = async (): Promise<void> => {
  if (!isEmpty(mongo)) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
  }
};

export const dropCollections = async (): Promise<void> => {
  if (!isEmpty(mongo)) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.drop();
    }
  }
};
