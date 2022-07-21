import type { PointsCollection } from '../types';
import type { UserDocument, UserDocumentObject } from '../models/User';
import type { GetServerSideProps, NextPage } from 'next';

import {
  getReviewDocumentObject,
  getUserDocumentObject,
  getTutorGeoJSON,
  getUsersPointsCollection,
} from '../utils/casting-helpers';
import ClusterMap from '../components/cluster-map/ClusterMap';
import { Grid, GridItem, Box, Flex, Alert, AlertIcon } from '@chakra-ui/react';
import React from 'react';
import Layout from '../components/global/Layout';

interface Props {
  points: PointsCollection;
  currentUser: UserDocumentObject | null;
  allSubjects: string[];
}

const Home: NextPage<Props> = ({ currentUser, points, allSubjects }) => (
  <ClusterMapContextProvider
    points={points}
    authenticatedTutor={
      currentUser?.isTutor ? getTutorGeoJSON(currentUser) : null
    }
  >
    <ClusterMapContext.Consumer>
      {clusterMapCtx => (
        <Layout>
          <Box width="90%" mx="auto">
            {clusterMapCtx.filteredPoints && (
              <Alert
                status={
                  clusterMapCtx.filteredPoints.features.length
                    ? 'success'
                    : 'error'
                }
                mt="4"
              >
                <AlertIcon />
                Found {clusterMapCtx.filteredPoints.features.length} tutors
              </Alert>
            )}
            <Grid
              templateColumns="repeat(12, 1fr)"
              templateRows="repeat(12, 1fr)"
              gap={[4, null, null, 6]}
              my={4}
            >
              <GridItem
                colSpan={[12, null, null, 8, 9]}
                rowSpan={[5, null, 12]}
              >
                <Flex
                  alignItems={[null, null, null, 'center']}
                  justifyContent={[null, null, null, 'center']}
                  width="100%"
                  height="100%"
                >
                  <ClusterMap />
                </Flex>
              </GridItem>
              <GridItem
                colSpan={[12, null, null, 4, 3]}
                rowSpan={[7, null, 12]}
              >
                <FiltersForm allSubjects={allSubjects} />
              </GridItem>
            </Grid>
          </Box>
        </Layout>
      )}
    </ClusterMapContext.Consumer>
  </ClusterMapContextProvider>
);

import { authOptions } from './api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import connectDB from '../middleware/mongo-connect';
import Review from '../models/Review';
import User from '../models/User';
import FiltersForm from '../components/cluster-map/FiltersForm';
import ClusterMapContextProvider from '../store/ClusterMapProvider';
import ClusterMapContext from '../store/cluster-map-context';
import type { ReviewDocument, ReviewDocumentObject } from '../models/Review';

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

  const tutors = await User.find({
    isTutor: true,
    email: { $ne: session?.user?.email },
  })
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
        points: getUsersPointsCollection(populatedTutorObjects),
      },
    };
  }
  return {
    props: {
      allSubjects,
      currentUser: null,
      points: getUsersPointsCollection(populatedTutorObjects),
    },
  };
};

export default Home;
