import type { TutorObjectGeoJSON } from '../types';
import type { UserDocument, UserDocumentObject } from '../models/User';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import type { GetServerSideProps, NextPage } from 'next';
import ClusterMap from '../components/cluster-map/ClusterMap';
import { signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

interface Props {
  features: FeatureCollection<Geometry, GeoJsonProperties> | null;
  currentUser: UserDocumentObject | null;
}

const Home: NextPage<Props> = ({ currentUser, features }) => {
  return features ? (
    <>
      <h1 style={{ textAlign: 'center' }}>HomePage</h1>
      {/* === ONLY FOR TO SAVE ON MAPBOX LOADS IN DEVELOPMENT */}
      {/* <ClusterMap tutors={features} /> */}
      <ul>
        {features.features.map(f => (
          <li key={f.properties?._id}>
            <div>{f.properties?.email}</div>
            <div>{f.properties?._id}</div>
            <div>
              <Link href={`/tutors/${f.properties!._id}`}>Learn more</Link>
              <br />
              <Link href={`/tutors/${f.properties!._id}/sessions/new`}>
                Book session
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {/* === */}
      {!currentUser && <button onClick={() => signIn()}>Sign in</button>}
      {currentUser && (
        <>
          <div>{currentUser?.email}</div>
          <div>{currentUser?.fullname}</div>
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

import { getUserDocumentObject } from '../utils/user-casting-helpers';
import { authOptions } from './api/auth/[...nextauth]';
import connectDB from '../middleware/mongo-connect';
import { getServerSession } from 'next-auth';
import Review from '../models/Review';
import User from '../models/User';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  type FeatureCollectionObject = {
    type: 'FeatureCollection';
    features: TutorObjectGeoJSON[];
  };
  const [, session] = await Promise.all([
    connectDB(),
    getServerSession(context, authOptions),
  ]);
  const tutors = await User.find({ isTutor: true })
    .populate({
      path: 'reviews',
      options: {
        sort: { _id: -1 },
      },
      model: Review,
    })
    .exec();

  const features: FeatureCollectionObject = {
    type: 'FeatureCollection',
    features: tutors.map(
      (tutor): TutorObjectGeoJSON => ({
        type: 'Feature',
        properties: {
          cluster: false,
          ...getUserDocumentObject(tutor as UserDocument),
        },
        geometry: { type: 'Point', coordinates: tutor.coordinates },
      })
    ),
  };

  if (session) {
    return {
      props: {
        currentUser: session.user as UserDocumentObject,
        features,
      },
    };
  }
  return {
    props: {
      currentUser: null,
      features,
    },
  };
};

export default Home;
