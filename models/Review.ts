import { Schema, model, models, Document, Model } from 'mongoose';
import type { ObjectId } from 'mongoose';

export interface Review {
  stars: number;
  tutorId: ObjectId | string;
  text?: string;
}

export interface ReviewDocumentObject extends Review {
  _id: string;
  ownerAuthenticated?: boolean;
}

export type ReviewDocument = Review & Document;

type ReviewModel = Model<ReviewDocument>;

const reviewSchema = new Schema<ReviewDocument, ReviewModel>({
  stars: {
    type: Number,
    required: true,
    min: [0, 'You must give at the least {MIN} stars'],
    max: [5, 'You can give at the most {MAX} stars'],
  },
  text: String,
  tutorId: { type: Schema.Types.ObjectId, ref: 'User' },
});

export default models.Review ||
  model<ReviewDocument, ReviewModel>('Review', reviewSchema);
