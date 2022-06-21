import type { NextPage } from 'next';
import ClusterMap from '../components/cluster-map/ClusterMap';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { useEffect, useState } from 'react';
import { FakeTutorsAPIResponseType } from '../types';
import { useSession, signIn, signOut } from 'next-auth/react';

const Home: NextPage = () => {
  const [features, setFeatures] = useState<FakeTutorsAPIResponseType | null>();
  const { data: session, status } = useSession();

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
  );
};

export default Home;
