import type { NextPage } from 'next';
import ClusterMap from '../components/cluster-map/ClusterMap';
import { useEffect, useState } from 'react';
import { UserDocument, TutorObjectGeoJSON } from '../types';
import { useSession, signIn, signOut } from 'next-auth/react';
import ApiHelper from '../utils/api-helper';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

type StateType = FeatureCollection<Geometry, GeoJsonProperties> | null;

const Home: NextPage = () => {
  const [features, setFeatures] = useState<StateType>();
  const { data: session, status } = useSession();

  useEffect(() => {
    ApiHelper('/api/tutors', {}, 'GET').then((tutors: UserDocument[]) => {
      const features = tutors.map(
        (tutor): TutorObjectGeoJSON => ({
          type: 'Feature',
          properties: {
            cluster: false,
            ...tutor,
          },
          geometry: { type: 'Point', coordinates: tutor.coordinates },
        })
      );
      setFeatures({ type: 'FeatureCollection', features });
    });
  }, []);

  return features ? (
    <>
      <h1 style={{ textAlign: 'center' }}>HomePage</h1>
      <ClusterMap tutors={features} />
      {status === 'unauthenticated' && (
        <button onClick={() => signIn()}>Sign in</button>
      )}
      {status === 'authenticated' && (
        <>
          <div>{session!.user!.email}</div>
          <div>{session!.user!.name}</div>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
    </>
  ) : (
    <h1>Loading map</h1>
  );
};

export default Home;
