import type { NextPage } from 'next';
import ClusterMap from '../components/cluster-map/ClusterMap';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { useEffect, useState } from 'react';
import { FakeTutorsAPIResponseType } from '../types';

const Home: NextPage = () => {
  const [features, setFeatures] = useState<FakeTutorsAPIResponseType | null>();
  useEffect(() => {
    fetch('/api/tutors')
      .then(res => res.json())
      .then(features => setFeatures(features));
  }, []);
  return (
    <>
      <h1 style={{ textAlign: 'center' }}>HomePage</h1>
      <ClusterMap
        tutors={features as FeatureCollection<Geometry, GeoJsonProperties>}
      />
    </>
  );
};

export default Home;
