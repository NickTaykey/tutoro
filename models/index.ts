import type { Mongoose } from 'mongoose';
import mongoose from 'mongoose';
import Session from './Session';
import Review from './Review';
import Post from './Post';
import User from './User';

(async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      let globalWithMongoClient = global as typeof globalThis & {
        _mongoClient: Mongoose;
      };

      if (!process.env.DEV_DB_URL) {
        throw new Error(
          'No DB urls for provided for development var DEV_DB_URL'
        );
      }

      if (!globalWithMongoClient._mongoClient) {
        globalWithMongoClient._mongoClient = await mongoose.connect(
          process.env.DEV_DB_URL!
        );
      }
    } else {
      if (!process.env.DEV_DB_URL) {
        throw new Error(
          'No DB urls for provided for productions var PROD_DB_URL'
        );
      }

      await mongoose.connect(process.env.PROD_DB_URL!);
    }
  } catch (err) {
    throw new Error(
      'Something went wrong and a connection with the DB cannot be esablished'
    );
  }
})();

export { User, Post, Review, Session };
