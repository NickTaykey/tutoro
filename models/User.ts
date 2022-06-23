import { Schema, model, models, Document } from 'mongoose';

export interface IUser extends Document {
  fullname: string;
  email: string;
  avatar?: string;
  isTutor: boolean;
  createdReviews: Schema.Types.ObjectId[];
  reviews: Schema.Types.ObjectId[];
  coordinates: [number, number];
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  fullname: { type: String, required: true },
  avatar: String,
  isTutor: { type: Boolean, default: false },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  createdReviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  coordinates: [],
});

export default models.User || model('User', userSchema);
