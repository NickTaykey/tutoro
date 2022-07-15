import ReviewForm, { ReviewFormTypes } from '../reviews/ReviewForm';
import ReviewsContextProvider from '../../store/ReviewsProvider';
import ReviewContext from '../../store/reviews-context';
import { useSession } from 'next-auth/react';
import Review from '../reviews/Review';
import Link from 'next/link';
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
} from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';
import { useState } from 'react';

interface Props {
  host: String;
  tutor: UserDocumentObject;
  userCreatedReviews: string[];
}

const TutorPage: React.FC<Props> = ({
  tutor,
  userCreatedReviews: userCreatedReviewsProp,
  host,
}: Props) => {
  const { status, data } = useSession();
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

  let markup = <h1>404 Tutor not found!</h1>;
  if (tutor && tutor.reviews) {
    markup = (
      <Layout>
        <Box width={['90%', null, null, '80%']} mx="auto">
          <Heading as="h1" size="xl" my="5">
            {tutor.fullname}
          </Heading>
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
          <Grid templateColumns="repeat(2, 1fr)" columnGap="4" my="4">
            <GridItem colSpan={[2, null, null, 1]}>
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
              <Heading as="h2" size="md" my="3">
                Reviews
              </Heading>
              <VStack alignItems="start">
                <ReviewsContextProvider
                  reviews={tutor.reviews.map(r => ({
                    ...r,
                    ownerAuthenticated:
                      userCreatedReviews.indexOf(r._id) !== -1,
                  }))}
                >
                  <ReviewContext.Consumer>
                    {reviewsCtx => (
                      <>
                        {status === 'authenticated' &&
                          data?.user?.email !== tutor.email &&
                          !reviewsCtx.reviews.some(r =>
                            userCreatedReviews.includes(r._id)
                          ) && (
                            <ReviewForm
                              type={ReviewFormTypes.Create}
                              tutorId={tutor._id}
                              addUserCreateReviewId={addUserCreateReviewId}
                            />
                          )}
                        {status === 'unauthenticated' && (
                          <Link
                            href={`http://${host}/api/auth/signin?callbackUrl=/tutors/${tutor._id}`}
                          >
                            Sign In
                          </Link>
                        )}
                        {reviewsCtx.reviews.map((r: ReviewDocumentObject) => (
                          <Review
                            key={r._id}
                            review={r}
                            deleteUserCreateReviewId={deleteUserCreateReviewId}
                          />
                        ))}
                      </>
                    )}
                  </ReviewContext.Consumer>
                </ReviewsContextProvider>
              </VStack>
            </GridItem>
          </Grid>
        </Box>
      </Layout>
    );
  }
  return markup;
};

export default TutorPage;
