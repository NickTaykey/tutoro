export type TutorObjectGeoJSON = {
  type: 'Feature';
  properties: {
    _id: string;
    cluster: false;
    username: string;
    name: string;
    sex: string;
    mail: string;
    birthdate: string;
    address: string;
    reviews: TutorReviewObject[];
  };
  geometry: { type: 'Point'; coordinates: number[] };
};

export type TutorReviewObject = {
  _id: string;
  stars: number;
  text: string;
  username: string;
};

export type FakeTutorsAPIResponseType = {
  type: 'FeatureCollection';
  features: TutorObjectGeoJSON[];
};
