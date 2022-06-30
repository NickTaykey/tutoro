export type TutorReviewObject = {
  _id: string;
  stars: number;
  text?: string;
  ownerAuthenticated?: boolean;
};

export type UserDocument = {
  _id: string;
  fullname: string;
  email: string;
  reviews: TutorReviewObject[];
  requestedSessions: SessionDocument[];
  bookedSessions: SessionDocument[];
  createdReviews: TutorReviewObject[];
  coordinates: [number, number];
  address?: string;
};

export type TutorObjectGeoJSONProperties = UserDocument & { cluster: false };

export type TutorObjectGeoJSON = {
  type: 'Feature';
  properties: TutorObjectGeoJSONProperties;
  geometry: { type: 'Point'; coordinates: [number, number] };
};

export type TutorsGeoJSONCollection = {
  type: 'FeatureCollection';
  features: TutorObjectGeoJSON[];
};

export type HTTPError = { errorMessage: string; error?: string };

export type ReviewAPIResponse = TutorReviewObject | HTTPError;

export interface ISession {
  subject: string;
  topic: string;
  hours: number;
  approved: boolean;
  date: Date;
}

export interface SessionDocument extends ISession {
  _id: string;
}
