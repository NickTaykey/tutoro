import ClusterMap from '../components/cluster-map/ClusterMap';
import { useEffect, useState } from 'react';
import type { TutorObjectGeoJSON } from '../types';
import type { UserDocumentObject } from '../models/User';
import { signIn, signOut } from 'next-auth/react';
import ApiHelper from '../utils/api-helper';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import type { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';

type StateType = FeatureCollection<Geometry, GeoJsonProperties> | null;

interface Props {
  currentUser: UserDocumentObject | null;
}

const Home: NextPage<Props> = (props: Props) => {
  const [features, setFeatures] = useState<StateType>();
  useEffect(() => {
    ApiHelper('/api/tutors', {}, 'GET').then((tutors: UserDocumentObject[]) => {
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
      {!props.currentUser && <button onClick={() => signIn()}>Sign in</button>}
      {props.currentUser && (
        <>
          <div>{props.currentUser?.email}</div>
          <div>{props.currentUser?.fullname}</div>
          <div>
            <Link href="/users">Your profile page</Link>
          </div>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
      <div>
        {/* TEMPORARY LINKS ONLY FOR DEVELOPMENT PORPOSE */}
        <Link href={`/users/?q=USER-TESTING`}>User profile page</Link>
        <br />
        <Link href={`/users/?q=TUTOR-TESTING`}>Tutor profile page</Link>
      </div>
    </>
  ) : (
    <h1>Loading map</h1>
  );
};

import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const session = await getServerSession(context, authOptions);
  if (session) {
    return {
      props: {
        currentUser: session.user as UserDocumentObject,
      },
    };
  }
  return { props: { currentUser: null } };
};

export default Home;
