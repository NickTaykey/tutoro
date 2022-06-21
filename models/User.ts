import { Schema, model, models, Types } from 'mongoose';

interface IUSer {
  fullname: string;
  email: string;
  avatar?: string;
  isTutor: boolean;
  createdReviews: Types.DocumentArray<Types.ObjectId>[];
  reviews: Types.DocumentArray<Types.ObjectId>[];
}

const userSchema = new Schema<IUSer>({
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
});

export default models.User || model('User', userSchema);
