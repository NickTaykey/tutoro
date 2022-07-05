import type { TutorObjectGeoJSON } from '../types';
import type { UserDocument, UserDocumentObject } from '../models/User';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import type { GetServerSideProps, NextPage } from 'next';
import ClusterMap from '../components/cluster-map/ClusterMap';
import { signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

interface Props {
  points: FeatureCollection<Geometry, GeoJsonProperties> | null;
  currentUser: UserDocumentObject | null;
}

const Home: NextPage<Props> = ({ currentUser, points }) => {
  return points ? (
    <>
      <h1 style={{ textAlign: 'center' }}>HomePage</h1>
      {/* === ONLY FOR TO SAVE ON MAPBOX LOADS IN DEVELOPMENT */}
      <ClusterMap
        tutors={points}
        authenticatedTutor={
          currentUser
            ? ({
                type: 'Feature',
                properties: currentUser,
                geometry: {
                  type: 'Point',
                  coordinates: currentUser.coordinates,
                },
              } as TutorObjectGeoJSON)
            : null
        }
      />
      <ul>
        {points.features.map(f => (
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

import {
  getPopulatedReviews,
  getUserDocumentObject,
} from '../utils/user-casting-helpers';
import { authOptions } from './api/auth/[...nextauth]';
import connectDB from '../middleware/mongo-connect';
import { getServerSession } from 'next-auth';
import Review, { ReviewDocument } from '../models/Review';
import User from '../models/User';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const getPoints = (
    tutors: UserDocumentObject[]
  ): FeatureCollection<Geometry, GeoJsonProperties> => ({
    type: 'FeatureCollection',
    features: tutors.map(
      (tutor): TutorObjectGeoJSON => ({
        type: 'Feature',
        properties: {
          cluster: false,
          ...tutor,
        },
        geometry: { type: 'Point', coordinates: tutor.coordinates },
      })
    ),
  });

  const populateReviewsInDocuments = (tutors: UserDocument[]) => {
    return tutors.map(tutor => {
      const reviews = getPopulatedReviews(tutor.reviews as ReviewDocument[]);
      const tutorObject = getUserDocumentObject(tutor as UserDocument);
      tutorObject.reviews = reviews;
      return tutorObject;
    });
  };

  const [, session] = await Promise.all([
    connectDB(),
    getServerSession(context, authOptions),
  ]);

  const populateReviewsConfig = {
    path: 'reviews',
    options: {
      sort: { _id: -1 },
    },
    model: Review,
  };

  if (session && session.user) {
    const { _id: currentUserId } = session.user as UserDocument;
    const [unauthenticatedTutors, currentUser] = await Promise.all([
      User.find({
        isTutor: true,
        _id: { $ne: currentUserId },
      })
        .populate(populateReviewsConfig)
        .exec(),
      User.findById(currentUserId).populate(populateReviewsConfig).exec(),
    ]);

    const unauthenticatedTutorsObjects = populateReviewsInDocuments(
      unauthenticatedTutors as UserDocument[]
    );
    const currentUserObject = getUserDocumentObject(currentUser);
    currentUserObject.reviews = getPopulatedReviews(
      currentUser.reviews as ReviewDocument[]
    );

    return {
      props: {
        points: getPoints(unauthenticatedTutorsObjects),
        currentUser: currentUserObject,
      },
    };
  }

  const tutors = await User.find({
    isTutor: true,
  })
    .populate(populateReviewsConfig)
    .exec();

  const tutorsObjects = populateReviewsInDocuments(tutors as UserDocument[]);

  return {
    props: {
      points: getPoints(tutorsObjects),
      currentUser: null,
    },
  };
};

export default Home;
