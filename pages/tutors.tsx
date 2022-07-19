import type { TutorObjectGeoJSON, TutorFilters } from '../types';
import type { UserDocument, UserDocumentObject } from '../models/User';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import type { GetServerSideProps, NextPage } from 'next';
import ClusterMap from '../components/cluster-map/ClusterMap';
import {
  getReviewDocumentObject,
  getUserDocumentObject,
} from '../utils/user-casting-helpers';
import { Grid, GridItem, Alert, AlertIcon, Box, Flex } from '@chakra-ui/react';
import React from 'react';
import Layout from '../components/global/Layout';

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
  allSubjects: string[];
}

const Home: NextPage<Props> = ({ currentUser, points, allSubjects }) => {
  const [filteredPoints, setFilteredPoints] = useState<PointsCollection | null>(
    null
  );

  const filterTutorsHandler = (filters: TutorFilters | null) => {
    if (filters) {
      ApiHelper('/api/tutors/filter', filters, 'GET').then(res => {
        setFilteredPoints(
          getPoints(
            res.tutors.map((t: UserDocument) => getUserDocumentObject(t))
          )
        );
      });
    } else setFilteredPoints(null);
  };

  return points ? (
    <Layout>
      <Box width="90%" mx="auto">
        {filteredPoints && (
          <Alert status="success" mt="4">
            <AlertIcon />
            Found {filteredPoints.features.length} tutors matching
          </Alert>
        )}
        <Grid
          templateColumns="repeat(12, 1fr)"
          templateRows="repeat(12, 1fr)"
          gap={[4, null, null, 6]}
          my={4}
        >
          <GridItem colSpan={[12, null, null, 8, 9]} rowSpan={[5, null, 12]}>
            <Flex
              alignItems={[null, null, null, 'center']}
              justifyContent={[null, null, null, 'center']}
              width="100%"
              height="100%"
            >
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
                tutors={filteredPoints ? filteredPoints : points}
              />
            </Flex>
          </GridItem>
          <GridItem colSpan={[12, null, null, 4, 3]} rowSpan={[7, null, 12]}>
            <FiltersForm
              filterTutorsHandler={filterTutorsHandler}
              allSubjects={allSubjects}
            />
          </GridItem>
        </Grid>

        {/* <Link href="/tutors/global/posts/new">
        How just a question, a doubt, a homework? Post your question.
      </Link>
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
              <br />
              <Link href={`/tutors/${f.properties!._id}/posts/new`}>
                Ask a question
              </Link>
            </div>
          </li>
        ))}
      </ul> */}

        {/* <div>
      {/* TEMPORARY LINKS ONLY FOR DEVELOPMENT PORPOSE */}
        {/* <Link href={`/users/?q=USER-TESTING`}>User profile page</Link>
      <br />
      <Link href={`/users/?q=TUTOR-TESTING`}>Tutor profile page</Link>
      </div> */}
      </Box>
    </Layout>
  ) : (
    <h1>Loading map</h1>
  );
};

import { authOptions } from './api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import connectDB from '../middleware/mongo-connect';
import Review, { ReviewDocumentObject } from '../models/Review';
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
    userObject.reviews = reviewDocuments.map(r =>
      getReviewDocumentObject(r)
    ) as ReviewDocumentObject[];
    return userObject;
  });
  const allSubjects = Array.from(
    new Set(
      populatedTutorObjects.flatMap((t: UserDocumentObject) => t.subjects)
    )
  );
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
        allSubjects,
        currentUser: currentUserObject,
        points: getPoints(populatedTutorObjects),
      },
    };
  }
  return {
    props: {
      allSubjects,
      currentUser: null,
      points: getPoints(populatedTutorObjects),
    },
  };
};

export default Home;
