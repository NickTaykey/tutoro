import type { UserDocumentObject } from '../models/User';
import type { ObjectId } from 'mongoose';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

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
  NOT_APPROVED = 'not approved',
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
