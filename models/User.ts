import { Schema, model, models, Types } from 'mongoose';
import calcAvgRating from '../utils/calc-avg-rating';
import type { Model, ObjectId, Document } from 'mongoose';
import type { ReviewDocument, ReviewDocumentObject } from './Review';
import type { SessionDocument, SessionDocumentObject } from './Session';
import type { PostDocument, PostDocumentObject } from './Post';
import type { CloudFile } from '../types';

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

type PostsArray =
  | ObjectId[]
  | SessionDocument[]
  | Types.Array<ObjectId>
  | Types.Array<PostDocument>;

interface UserCoreObject {
  email: string;
  pricePerHour: number;
  fullname: string;
  isTutor: boolean;
  subjects: string[];
  bio: string;
  location: string;
  avatar?: CloudFile;
  avgRating: number;
  globalPostsEnabled: boolean;
  geometry?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

interface User extends UserCoreObject {
  calculateAvgRating(): void;
  posts: PostsArray;
  createdPosts: PostsArray;
  reviews: ReviewsArray;
  createdReviews: ReviewsArray;
  bookedSessions: SessionsArray;
  requestedSessions: SessionsArray;
}

export type UserDocument = User & Document;

export interface UserDocumentObject extends UserCoreObject {
  _id: string;
  posts: PostDocumentObject[];
  createdPosts: PostDocumentObject[];
  reviews: ReviewDocumentObject[];
  createdReviews: ReviewDocumentObject[];
  bookedSessions: SessionDocumentObject[];
  requestedSessions: SessionDocumentObject[];
}

type UserModel = Model<UserDocument>;

interface InstanceMethods {
  calculateAvgRating(): void;
}

const reviewsArrayObject = {
  type: Schema.Types.ObjectId,
  ref: 'Review',
};
const sessionsArrayObject = {
  type: Schema.Types.ObjectId,
  ref: 'Session',
};
const postsArrayObject = {
  type: Schema.Types.ObjectId,
  ref: 'Post',
};

const userSchema = new Schema<UserDocument, UserModel, {}, InstanceMethods>({
  email: { type: String, required: true, unique: true },
  pricePerHour: { type: Number, default: 0 },
  fullname: { type: String, required: true },
  isTutor: { type: Boolean, default: false },
  reviews: [reviewsArrayObject],
  createdReviews: [reviewsArrayObject],
  bookedSessions: [sessionsArrayObject],
  requestedSessions: [sessionsArrayObject],
  posts: [postsArrayObject],
  createdPosts: [postsArrayObject],
  subjects: [],
  bio: String,
  location: String,
  avatar: {
    url: { type: String, default: '' },
    public_id: { type: String, default: '' },
  },
  geometry: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
  },
  avgRating: { type: Number, default: 0 },
  globalPostsEnabled: { type: Boolean, default: true },
});

userSchema.pre('save', function (next) {
  if (!this.isTutor && !this.geometry?.coordinates) {
    this.geometry = undefined;
  }
  next();
});

userSchema.methods.calcAvgRating = async function () {
  await this.populate('reviews');
  if (this.reviews.length) {
    this.avgRating = calcAvgRating(this.reviews as ReviewDocument[]);
  }
  await this.save();
};

userSchema.index({ geometry: '2dsphere' });

export default models.User ||
  model<UserDocument, UserModel>('User', userSchema);
