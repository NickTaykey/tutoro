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
      if (!globalWithMongoClient._mongoClient) {
        globalWithMongoClient._mongoClient = await mongoose.connect(
          'mongodb://localhost:27017/tutoro'
        );
      }
    } else {
      if (!process.env.MONGO_ATLAS_USERNAME || !process.env.MONGO_ATLAS_PWD) {
        throw new Error(
          `No ${
            !process.env.MONGO_ATLAS_USERNAME
              ? 'MONGO_ATLAS_USERNAME'
              : 'MONGO_ATLAS_PWD'
          } provided`
        );
      }
      await mongoose.connect(
        `mongodb+srv://${process.env.MONGO_ATLAS_USERNAME}:${process.env.MONGO_ATLAS_PWD}@cluster0.ka6g6.mongodb.net/?retryWrites=true&w=majority`
      );
    }
  } catch (err) {
    console.error(err);
  }
})();

export { User, Post, Review, Session };
