import ReviewForm, { ReviewFormTypes } from '../reviews/ReviewForm';
import ReviewsContextProvider from '../../store/ReviewsProvider';
import ReviewContext from '../../store/reviews-context';
import { useSession } from 'next-auth/react';
import Review from '../reviews/Review';
import Map, { Marker } from 'react-map-gl';
import Layout from '../global/Layout';

import type { ReviewDocumentObject } from '../../models/Review';
import type { UserDocumentObject } from '../../models/User';
import {
  Heading,
  Flex,
  Text,
  VStack,
  Badge,
  Grid,
  GridItem,
  Box,
  Center,
  Button,
  Avatar,
} from '@chakra-ui/react';
import { FaPen, FaPersonBooth, FaStar } from 'react-icons/fa';
import { useState } from 'react';
import { useRouter } from 'next/router';

interface Props {
  tutor?: UserDocumentObject;
  userCreatedReviews: string[];
  isUserAllowedToReview: boolean;
}

const TutorPage: React.FC<Props> = ({
  tutor,
  userCreatedReviews: userCreatedReviewsProp,
  isUserAllowedToReview,
}: Props) => {
  const { status, data } = useSession();
  const { push } = useRouter();
  const [userCreatedReviews, setUserCreatedReviews] = useState<string[]>(
    userCreatedReviewsProp
  );
  const deleteUserCreateReviewId = (reviewId: string) => {
    setUserCreatedReviews(prevState => {
      return prevState.filter(rid => rid !== reviewId);
    });
  };
  const addUserCreateReviewId = (reviewId: string) => {
    setUserCreatedReviews(prevState => [...prevState, reviewId]);
  };

  return (
    <Layout>
      {tutor ? (
        <Box width={['90%', null, null, '80%']} mx="auto">
          <Flex alignItems="center">
            <Avatar
              src={tutor.avatar?.url ? tutor.avatar?.url : ''}
              name={tutor.fullname}
            />
            <Heading as="h1" size="xl" my="5" ml="2">
              {tutor.fullname}
            </Heading>
          </Flex>
          <Grid templateColumns="repeat(2, 1fr)" columnGap="4" my="4">
            <GridItem colSpan={[2, null, null, 1]}>
              <Box>
                <strong>Tutor in: </strong>
                {tutor.subjects.map(s => (
                  <Badge mr="1" fontSize="0.8em" colorScheme="gray" key={s}>
                    {s}
                  </Badge>
                ))}
              </Box>
              <Flex justify="start" my="3">
                {Array(tutor.avgRating)
                  .fill(null)
                  .map((_, i) => (
                    <FaStar key={i} size={25} color="#ffbe0b" />
                  ))}
                {Array(5 - tutor.avgRating)
                  .fill(null)
                  .map((_, i) => (
                    <FaStar key={i} size={25} color="#e5e5e5" />
                  ))}
              </Flex>
              <Text>
                <strong>Bio: </strong>
                {tutor.bio}
              </Text>
              <Flex direction="column" width="100%">
                <Button
                  mt="3"
                  colorScheme="green"
                  width="100%"
                  leftIcon={<FaPersonBooth />}
                  onClick={() => push(`/tutors/${tutor._id}/sessions/new`)}
                >
                  Book session
                </Button>
                <Button
                  mt="3"
                  colorScheme="blue"
                  width="100%"
                  leftIcon={<FaPen />}
                  onClick={() => push(`/tutors/${tutor._id}/posts/new`)}
                >
                  Create a Post
                </Button>
              </Flex>
              <Heading as="h2" size="md" my="3">
                Location
              </Heading>
              <Map
                initialViewState={{
                  latitude: tutor.geometry?.coordinates[1],
                  longitude: tutor.geometry?.coordinates[0],
                  zoom: 7,
                  bearing: 0,
                  pitch: 0,
                }}
                style={{ height: '50vh', maxHeight: '500px' }}
                mapStyle="mapbox://styles/mapbox/streets-v10"
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                testMode={true}
              >
                <Marker
                  longitude={tutor.geometry!.coordinates[0]}
                  latitude={tutor.geometry!.coordinates[1]}
                  color="#11b4da"
                />
              </Map>
            </GridItem>
            <GridItem colSpan={[2, null, null, 1]}>
              <Heading as="h2" size="md" mt={[5, null, 0]}>
                Reviews
              </Heading>
              <VStack
                height={tutor.reviews.length ? '500px' : '100%'}
                maxHeight={tutor.reviews.length ? '500px' : 'auto'}
                justify={tutor.reviews.length ? 'start' : 'center'}
                alignItems={tutor.reviews.length ? 'start' : 'center'}
              >
                <ReviewsContextProvider
                  reviews={tutor.reviews.map(r => ({
                    ...r,
                    ownerAuthenticated:
                      userCreatedReviews.indexOf(r._id) !== -1,
                  }))}
                >
                  <ReviewContext.Consumer>
                    {reviewsCtx => {
                      const isNotTutor = data?.user?.email !== tutor.email;
                      const hasNotAlreadyReviewed = !reviewsCtx.reviews.some(
                        r => userCreatedReviews.includes(r._id)
                      );
                      return (
                        <>
                          {status === 'authenticated' &&
                            hasNotAlreadyReviewed &&
                            isNotTutor &&
                            isUserAllowedToReview && (
                              <ReviewForm
                                type={ReviewFormTypes.Create}
                                tutorId={tutor._id}
                                addUserCreateReviewId={addUserCreateReviewId}
                              />
                            )}
                          {status === 'unauthenticated' && (
                            <Flex alignItems="center" width="100%" my="5">
                              <FaPen size={20} />
                              <Heading as="h3" size="md" ml="3">
                                Sign In to review this Tutor
                              </Heading>
                            </Flex>
                          )}
                          {status === 'authenticated' &&
                            !isUserAllowedToReview &&
                            isNotTutor && (
                              <Flex alignItems="center" width="100%" my="5">
                                <FaPen size={20} />
                                <Heading as="h3" size="md" ml="3">
                                  Have a Session or Post to review
                                </Heading>
                              </Flex>
                            )}
                          {reviewsCtx.reviews.length ? (
                            reviewsCtx.reviews.map(
                              (r: ReviewDocumentObject) => (
                                <Review
                                  key={r._id}
                                  review={r}
                                  deleteUserCreateReviewId={
                                    deleteUserCreateReviewId
                                  }
                                />
                              )
                            )
                          ) : (
                            <Heading as="h2" size="md" textAlign="center">
                              Be the first to review by having a Session or Post
                            </Heading>
                          )}
                        </>
                      );
                    }}
                  </ReviewContext.Consumer>
                </ReviewsContextProvider>
              </VStack>
            </GridItem>
          </Grid>
        </Box>
      ) : (
        <Flex height="50vh" justify="center">
          <Center>
            <Heading as="h1" size="xl">
              404 Tutor not found
            </Heading>
          </Center>
        </Flex>
      )}
    </Layout>
  );
};

export default TutorPage;
