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
import {
  Grid,
  GridItem,
  Box,
  Alert,
  AlertIcon,
  Heading,
  Button,
  Tooltip,
} from '@chakra-ui/react';
import React, { useContext } from 'react';

interface Props {
  points: PointsCollection;
  allSubjects: string[];
}

const Home: NextPage<Props> = ({ points, allSubjects }) => {
  const { user, openSignInMenu } = useContext(AuthenticatedUserContext);
  const { push, query } = useRouter();
  return (
    <ClusterMapContextProvider
      points={points}
      authenticatedTutor={user?.isTutor ? getTutorGeoJSON(user) : null}
    >
      <ClusterMapContext.Consumer>
        {clusterMapCtx => (
          <>
            <Box width="90%" mx="auto">
              {query.errorAlert && (
                <Alert status="error">{query.errorAlert}</Alert>
              )}
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
                templateRows="repeat(11, 1fr)"
                gap={[4, null, null, 6]}
                my={4}
              >
                <GridItem
                  colSpan={[12, null, null, 8, 9]}
                  rowSpan={[5, null, 12]}
                >
                  <Grid
                    templateColumns="1fr"
                    templateRows="10fr 2fr"
                    alignItems={[null, null, null, 'center']}
                    justifyContent={[null, null, null, 'center']}
                    width="100%"
                    height="100%"
                    gap="0"
                  >
                    <GridItem
                      height="100%"
                      boxShadow={'-5px 5px 5px 1px rgba(0, 0, 0, 0.25)'}
                    >
                      <ClusterMap />
                    </GridItem>
                    <GridItem>
                      <Box>
                        <Heading as="h2" size="lg" my="3">
                          Not sure who to ask?
                        </Heading>
                        <Tooltip
                          hasArrow
                          label="Our first Tutor available will answer your Post"
                          bg="gray.300"
                          color="black"
                          placement="right"
                        >
                          <Button
                            width={['100%', null, 'auto']}
                            onClick={() =>
                              user
                                ? push('/tutors/global/posts/new')
                                : openSignInMenu()
                            }
                            leftIcon={<FaGlobe />}
                          >
                            New global post
                          </Button>
                        </Tooltip>
                      </Box>
                    </GridItem>
                  </Grid>
                </GridItem>
                <GridItem
                  colSpan={[12, null, null, 4, 3]}
                  rowSpan={[7, null, 12]}
                >
                  <FiltersForm allSubjects={allSubjects} />
                </GridItem>
              </Grid>
            </Box>
          </>
        )}
      </ClusterMapContext.Consumer>
    </ClusterMapContextProvider>
  );
};

import { authOptions } from './api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import connectDB from '../middleware/mongo-connect';
import Review from '../models/Review';
import User from '../models/User';
import FiltersForm from '../components/cluster-map/FiltersForm';
import ClusterMapContextProvider from '../store/ClusterMapProvider';
import ClusterMapContext from '../store/cluster-map-context';
import type { ReviewDocument, ReviewDocumentObject } from '../models/Review';
import { useRouter } from 'next/router';
import { FaGlobe } from 'react-icons/fa';
import AuthenticatedUserContext from '../store/authenticated-user-context';

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
    return {
      props: {
        allSubjects,
        points: getUsersPointsCollection(populatedTutorObjects),
      },
    };
  }
  return {
    props: {
      allSubjects,
      points: getUsersPointsCollection(populatedTutorObjects),
    },
  };
};

export default Home;
