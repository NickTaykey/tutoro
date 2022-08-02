import mongoose from 'mongoose';
import type { Mongoose } from 'mongoose';

let clientPromise: Promise<Mongoose>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongoClientPromise = global as typeof globalThis & {
    _mongoClientPromise: Promise<Mongoose>;
  };

  if (!process.env.DEV_DB_URL) {
    throw new Error('No DB urls for provided for development var DEV_DB_URL');
  }

  if (!globalWithMongoClientPromise._mongoClientPromise) {
    globalWithMongoClientPromise._mongoClientPromise = mongoose.connect(
      process.env.DEV_DB_URL!
    );
  }

  clientPromise = globalWithMongoClientPromise._mongoClientPromise;
} else {
  if (!process.env.DEV_DB_URL) {
    throw new Error('No DB urls for provided for productions var PROD_DB_URL');
  }

  clientPromise = mongoose.connect(process.env.PROD_DB_URL!);
}

export default clientPromise;
