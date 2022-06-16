export type TutorObjectGeoJSON = {
  type: 'Feature';
  properties: {
    cluster: false;
    username: string;
    name: string;
    sex: string;
    mail: string;
    birthdate: string;
    address: string;
  };
  geometry: { type: 'Point'; coordinates: number[] };
};

export type FakeTutorsAPIResponseType = {
  type: 'FeatureCollection';
  features: TutorObjectGeoJSON[];
};
