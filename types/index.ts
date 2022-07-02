import type { UserDocumentObject } from '../models/User';

export type TutorObjectGeoJSONProperties = UserDocumentObject & {
  cluster: false;
};

export type TutorObjectGeoJSON = {
  type: 'Feature';
  properties: TutorObjectGeoJSONProperties;
  geometry: { type: 'Point'; coordinates: [number, number] };
};

export type HTTPError = { errorMessage: string; error?: string };
