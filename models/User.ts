import { Schema, model, models, Types } from 'mongoose';
import type { Model, ObjectId, Document } from 'mongoose';
import type { ReviewDocument, ReviewDocumentObject } from './Review';
import type { SessionDocument, SessionDocumentObject } from './Session';

type ReviewsArray =
  | ObjectId[]
  | ReviewDocument[]
  | Types.Array<ObjectId>
  | Types.Array<ReviewDocument>;

type SessionsArray =
  | ObjectId[]
  | SessionDocument[]
  | Types.Array<ObjectId>
  | Types.Array<SessionDocument>;

interface UserCoreObject {
  email: string;
  pricePerHour: number;
  fullname: string;
  isTutor: boolean;
  subjects: string[];
  bio: string;
  location: string;
  avatar: string;
  geometry?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

interface User extends UserCoreObject {
  reviews: ReviewsArray;
  createdReviews: ReviewsArray;
  bookedSessions: SessionsArray;
  requestedSessions: SessionsArray;
}

export type UserDocument = User & Document;

export interface UserDocumentObject extends UserCoreObject {
  _id: string;
  reviews: ReviewDocumentObject[];
  createdReviews: ReviewDocumentObject[];
  bookedSessions: SessionDocumentObject[];
  requestedSessions: SessionDocumentObject[];
}

type UserModel = Model<UserDocument>;

const reviewsArrayObject = {
  type: Schema.Types.ObjectId,
  ref: 'Review',
};
const sessionsArrayObject = {
  type: Schema.Types.ObjectId,
  ref: 'Session',
};

const userSchema = new Schema<UserDocument, UserModel>({
  email: { type: String, required: true, unique: true },
  pricePerHour: { type: Number, default: 0 },
  fullname: { type: String, required: true },
  isTutor: { type: Boolean, default: false },
  reviews: [reviewsArrayObject],
  createdReviews: [reviewsArrayObject],
  bookedSessions: [sessionsArrayObject],
  requestedSessions: [sessionsArrayObject],
  subjects: [],
  bio: String,
  location: String,
  avatar: String,
  geometry: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
  },
});

userSchema.pre('save', function (next) {
  if (!this.isTutor && !this.geometry?.coordinates) {
    this.geometry = undefined;
  }
  next();
});

userSchema.index({ geometry: '2dsphere' });

export default models.User ||
  model<UserDocument, UserModel>('User', userSchema);
