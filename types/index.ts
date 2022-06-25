export type TutorReviewObject = {
  _id: string;
  stars: number;
  text?: string;
  ownerAuthenticated: boolean;
};

export type UserDocument = {
  _id: string;
  fullname: string;
  email: string;
  reviews: TutorReviewObject[];
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
