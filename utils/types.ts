import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import type { UserDocument, UserDocumentObject } from '../models/User';
import type { Model, ObjectId } from 'mongoose';
import type { NextApiRequest } from 'next';

import type { SessionDocument } from '../models/Session';
import type { ReviewDocument } from '../models/Review';
import type { PostDocument } from '../models/Post';

export type TutorObjectGeoJSONProperties = UserDocumentObject & {
  subjects?: string[] | string;
  avatar?: CloudFile | string;
  cluster: false;
};

export type CloudFile = { public_id: string; url: string };

export type TutorObjectGeoJSON = {
  type: 'Feature';
  properties: TutorObjectGeoJSONProperties;
  geometry: { type: 'Point'; coordinates: [number, number] };
};

export type QueryObject = {
  email?: string;
  isTutor?: boolean;
  _id?: ObjectId;
};

export enum SessionStatus {
  APPROVED = 'approved',
  NOT_APPROVED = 'not_approved',
  REJECTED = 'rejected',
}

export type HTTPError = { errorMessage: string; error?: string };

export type TutorFiltersFormFields = {
  distance: number;
  name: string;
  location: string;
  sessionPriceMin: number;
  sessionPriceMax: number;
  postPriceMin: number;
  postPriceMax: number;
  starsMin: number;
  starsMax: number;
  subject: string;
};

export type TutorFilters = {
  distance: number;
  name: string;
  sessionPriceMin: number;
  sessionPriceMax: number;
  postPriceMin: number;
  postPriceMax: number;
  starsMin: number;
  starsMax: number;
  subject: string;
  location: [number, number] | string | null;
};

export type AnswerFormFields = {
  text: string;
};

export type NewPostFormFields = {
  subject: string;
  description: string;
};

export enum PostStatus {
  ANSWERED = 'answered',
  NOT_ANSWERED = 'not_answered',
  CLOSED = 'closed',
}

export enum PostType {
  GLOBAL = 'global',
  SPECIFIC = 'specific',
}

export type PointsCollection = FeatureCollection<Geometry, GeoJsonProperties>;

export interface ExtendedRequest extends NextApiRequest {
  models: Record<
    string,
    Model<UserDocument | PostDocument | ReviewDocument | SessionDocument>
  >;
  sessionUser: UserDocument;
  tutor?: UserDocument;
  user?: UserDocument;
}

export type Answer = { answer: string; answerAttachments: CloudFile[] };
