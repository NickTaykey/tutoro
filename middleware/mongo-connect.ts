import mongoose from 'mongoose';

let connection: typeof mongoose | null = null;

const connectDB = async () => {
  const DB_URL = `mongodb+srv://${process.env.MONGO_ATLAS_USERNAME}:${process.env.MONGO_ATLAS_PWD}@cluster0.ka6g6.mongodb.net/?retryWrites=true&w=majority`;
  if (!connection) connection = await mongoose.connect(DB_URL);
  return connection;
};

export default connectDB;
