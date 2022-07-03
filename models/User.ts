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
  fullname: string;
  isTutor: boolean;
  coordinates: [number, number];
  subjects: string[];
  bio: string;
  location: string;
  avatar: string;
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
  coordinates: [],
});

export default models.User ||
  model<UserDocument, UserModel>('User', userSchema);
