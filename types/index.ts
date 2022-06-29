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
  requestedSessions: Session[];
  bookedSessions: Session[];
  coordinates: [number, number];
  address?: string;
};

export type TutorObjectGeoJSON = {
  type: 'Feature';
  properties: UserDocument & { cluster: false };
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

export interface Session extends ISession {
  _id: string;
}
