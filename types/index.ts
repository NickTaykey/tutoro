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

export type HTTPError = { errorMessage: string; error?: string };
