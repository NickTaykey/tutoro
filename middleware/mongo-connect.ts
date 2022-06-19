import mongoose from 'mongoose';

const connectDB = async () => {
  const c = await mongoose.connect(
    `mongodb+srv://${process.env.MONGO_ATLAS_USERNAME}:${process.env.MONGO_ATLAS_PWD}@cluster0.ka6g6.mongodb.net/?retryWrites=true&w=majority`
  );
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => console.log('successfully connected to the DB!'));
  return c;
};

export default connectDB;
