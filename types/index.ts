import type { UserDocumentObject } from '../models/User';
import type { ObjectId } from 'mongoose';

export type TutorObjectGeoJSONProperties = UserDocumentObject & {
  cluster: false;
};

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
  priceMin: number;
  priceMax: number;
  starsMin: number;
  starsMax: number;
  subject: string;
};

export type TutorFilters = {
  distance: number;
  name: string;
  priceMin: number;
  priceMax: number;
  starsMin: number;
  starsMax: number;
  subject: string;
  location: [number, number] | string | null;
};
