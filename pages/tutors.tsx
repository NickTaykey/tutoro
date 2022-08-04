import type { UserDocument, UserDocumentObject } from '../models/User';
import type { GetServerSideProps, NextPage } from 'next';
import type { PointsCollection } from '../utils/types';

import AuthenticatedUserContext from '../store/authenticated-user-context';
import ClusterMapContextProvider from '../store/ClusterMapProvider';
import FiltersForm from '../components/cluster-map/FiltersForm';
import ClusterMap from '../components/cluster-map/ClusterMap';
import ClusterMapContext from '../store/cluster-map-context';
import { FaGlobe } from 'react-icons/fa';
import { useRouter } from 'next/router';
import * as c from '@chakra-ui/react';
import { useContext } from 'react';

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
            <c.Box width="90%" mx="auto">
              {query.errorAlert && (
                <c.Alert status="error">
                  <c.AlertIcon />
                  {query.errorAlert}
                </c.Alert>
              )}
              {clusterMapCtx.filteredPoints && (
                <c.Alert
                  status={
                    clusterMapCtx.filteredPoints.features.length
                      ? 'success'
                      : 'error'
                  }
                  mt="4"
                >
                  <c.AlertIcon />
                  Found {clusterMapCtx.filteredPoints.features.length} tutors
                </c.Alert>
              )}
              <c.Grid
                templateColumns="repeat(12, 1fr)"
                templateRows="repeat(11, 1fr)"
                gap={[4, null, null, 6]}
                my={4}
              >
                <c.GridItem
                  colSpan={[12, null, null, 8, 9]}
                  rowSpan={[5, null, 12]}
                >
                  <c.Grid
                    templateColumns="1fr"
                    templateRows="10fr 2fr"
                    alignItems={[null, null, null, 'center']}
                    justifyContent={[null, null, null, 'center']}
                    width="100%"
                    height="100%"
                    gap="0"
                  >
                    <c.GridItem
                      height="100%"
                      boxShadow={'-5px 5px 5px 1px rgba(0, 0, 0, 0.25)'}
                    >
                      <ClusterMap />
                    </c.GridItem>
                    <c.GridItem>
                      <c.Box>
                        <c.Heading as="h2" size="lg" my="3" letterSpacing="1px">
                          Not sure who to ask?
                        </c.Heading>
                        <c.Tooltip
                          hasArrow
                          label="Our first Tutor available will answer your Post"
                          bg="gray.300"
                          color="black"
                          placement="right"
                        >
                          <c.Button
                            variant="cta"
                            width={['100%', null, 'auto']}
                            onClick={() =>
                              user
                                ? push('/tutors/global/posts/new')
                                : openSignInMenu()
                            }
                            leftIcon={<FaGlobe />}
                          >
                            New global post
                          </c.Button>
                        </c.Tooltip>
                      </c.Box>
                    </c.GridItem>
                  </c.Grid>
                </c.GridItem>
                <c.GridItem
                  colSpan={[12, null, null, 4, 3]}
                  rowSpan={[7, null, 12]}
                >
                  <FiltersForm allSubjects={allSubjects} />
                </c.GridItem>
              </c.Grid>
            </c.Box>
          </>
        )}
      </ClusterMapContext.Consumer>
    </ClusterMapContextProvider>
  );
};

import {
  getReviewDocumentObject,
  getUserDocumentObject,
  getTutorGeoJSON,
  getUsersPointsCollection,
} from '../utils/casting-helpers';
import { authOptions } from './api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import * as models from '../models';

import type { ReviewDocument, ReviewDocumentObject } from '../models/Review';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const populateReviewConfig = {
    path: 'reviews',
    options: {
      sort: { _id: -1 },
    },
    populate: [
      { path: 'user', model: models.User },
      { path: 'tutor', model: models.User },
    ],
    model: models.Review,
  };

  const session = await getServerSession(context, authOptions);

  const tutors = await models.User.find({
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
