import { Schema, model, models, Document, Model } from 'mongoose';
import User from './User';

import type { ObjectId } from 'mongoose';
import type { UserDocument, UserDocumentObject } from './User';

export interface Review {
  stars: number;
  tutor: ObjectId | UserDocument | UserDocumentObject | string;
  user: ObjectId | UserDocument | UserDocumentObject | string;
  text?: string;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

export interface ReviewDocumentObject extends Review {
  _id: string;
  ownerAuthenticated?: boolean;
}

export type ReviewDocument = Review & Document;

type ReviewModel = Model<ReviewDocument>;

const ReviewSchema = new Schema<ReviewDocument, ReviewModel>(
  {
    stars: {
      type: Number,
      required: true,
      min: [0, 'You must give at the least {MIN} stars'],
      max: [5, 'You can give at the most {MAX} stars'],
    },
    text: String,
    tutor: { type: Schema.Types.ObjectId, ref: 'User' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

ReviewSchema.pre('remove', async function () {
  return new Promise<void>(async resolve => {
    try {
      const [tutor, user]: UserDocument[] = await Promise.all([
        User.findById(this.tutor),
        User.findById(this.user),
      ]);
      user.createdReviews = (user.createdReviews as ObjectId[]).filter(id => {
        return id.toString() !== this._id.toString();
      });
      tutor.reviews = (tutor.reviews as ObjectId[]).filter(
        id => id.toString() !== this._id.toString()
      );
      await Promise.all([tutor.save(), user.save()]);
      return resolve();
    } catch (e) {
      return resolve();
    }
  });
});

export default models.Review ||
  model<ReviewDocument, ReviewModel>('Review', ReviewSchema);
