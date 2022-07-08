import type { TutorObjectGeoJSON, TutorFilters } from '../types';
import type { UserDocument, UserDocumentObject } from '../models/User';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import type { GetServerSideProps, NextPage } from 'next';
import ClusterMap from '../components/cluster-map/ClusterMap';
import {
  getReviewDocumentObject,
  getUserDocumentObject,
} from '../utils/user-casting-helpers';
import { signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

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
      geometry: {
        type: 'Point',
        coordinates: tutor.geometry!.coordinates,
      },
    })
  ),
});

type PointsCollection = FeatureCollection<Geometry, GeoJsonProperties>;

interface Props {
  points: PointsCollection | null;
  currentUser: UserDocumentObject | null;
}

const Home: NextPage<Props> = ({ currentUser, points }) => {
  const [filteredPoints, setFilteredPoints] = useState<PointsCollection | null>(
    null
  );
  const [geoLocatedUser, setGeoLocatedUser] = useState<[number, number] | null>(
    null
  );

  const filterTutorsHandler = (filters: TutorFilters | null) => {
    if (filters) {
      ApiHelper('/api/tutors/filter', filters, 'GET').then(res => {
        setGeoLocatedUser(res.geoLocatedUser);
        setFilteredPoints(
          getPoints(
            res.tutors.map((t: UserDocument) => getUserDocumentObject(t))
          )
        );
      });
    } else setFilteredPoints(null);
  };

  return points ? (
    <>
      <h1 style={{ textAlign: 'center' }}>HomePage</h1>
      {filteredPoints && (
        <h3>Found {filteredPoints.features.length} tutors matching</h3>
      )}
      <section style={{ display: 'flex' }}>
        <section>
          {/* === ONLY TO SAVE ON MAPBOX LOADS IN DEVELOPMENT */}
          <ClusterMap
            authenticatedTutor={
              currentUser?.isTutor
                ? ({
                    type: 'Feature',
                    properties: currentUser,
                    geometry: {
                      type: 'Point',
                      coordinates: currentUser.geometry!.coordinates,
                    },
                  } as TutorObjectGeoJSON)
                : null
            }
            geoLocatedUser={geoLocatedUser}
            tutors={filteredPoints ? filteredPoints : points}
          />
        </section>
        <section>
          <FiltersForm
            filterTutorsHandler={filterTutorsHandler}
            setGeoLocatedUser={setGeoLocatedUser}
          />
        </section>
      </section>
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

import { authOptions } from './api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import connectDB from '../middleware/mongo-connect';
import Review from '../models/Review';
import User from '../models/User';
import FiltersForm from '../components/cluster-map/FiltersForm';
import { useState } from 'react';
import ApiHelper from '../utils/api-helper';
import type { ReviewDocument } from '../models/Review';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const populateReviewConfig = {
    path: 'reviews',
    options: {
      sort: { _id: -1 },
    },
    populate: [
      { path: 'user', model: User },
      { path: 'tutor', model: User },
    ],
    model: Review,
  };

  const [session] = await Promise.all([
    getServerSession(context, authOptions),
    connectDB(),
  ]);

  const tutors = await User.find({ isTutor: true })
    .populate(populateReviewConfig)
    .exec();

  const populatedTutorObjects = tutors.map(t => {
    const userObject = getUserDocumentObject(t as UserDocument);
    const reviewDocuments = t.reviews as ReviewDocument[];
    userObject.reviews = reviewDocuments.map(r => getReviewDocumentObject(r));
    return userObject;
  });

  if (session && session?.user?.email) {
    const currentUser = await User.findOne({
      email: session.user.email,
    })
      .populate(populateReviewConfig)
      .exec();

    const currentUserObject = getUserDocumentObject(
      currentUser as UserDocument
    );
    currentUserObject.reviews = currentUser.reviews.map(
      getReviewDocumentObject
    );

    return {
      props: {
        currentUser: currentUserObject,
        points: getPoints(populatedTutorObjects),
      },
    };
  }
  return {
    props: {
      points: getPoints(populatedTutorObjects),
      currentUser: null,
    },
  };
};

export default Home;
