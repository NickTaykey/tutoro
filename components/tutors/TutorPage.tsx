import ReviewForm, { ReviewFormTypes } from '../reviews/ReviewForm';
import ReviewsContextProvider from '../../store/ReviewsProvider';
import ReviewContext from '../../store/reviews-context';
import Review from '../reviews/Review';
import Map, { Marker } from 'react-map-gl';

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
  useColorMode,
} from '@chakra-ui/react';
import { FaPen, FaPersonBooth, FaStar } from 'react-icons/fa';
import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import AuthenticatedUserContext from '../../store/authenticated-user-context';
import colors from '../../theme/colors';

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
  const { user, openSignInMenu } = useContext(AuthenticatedUserContext);
  const currentTutor = user?._id === tutor?._id ? user! : tutor!;
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

  const { colorMode, toggleColorMode } = useColorMode();

  return tutor ? (
    <Box width="90%" mx="auto">
      <Flex alignItems="center">
        <Avatar
          src={currentTutor.avatar?.url ? currentTutor.avatar?.url : ''}
          name={currentTutor.fullname}
        />
        <Heading as="h1" size="xl" my="5" ml="2">
          {currentTutor.fullname}
        </Heading>
      </Flex>
      <Grid templateColumns="repeat(2, 1fr)" columnGap="4" my="4">
        <GridItem colSpan={[2, null, null, 1]}>
          <Box>
            <strong>Tutor in: </strong>
            {currentTutor.subjects.map(s => (
              <Badge mr="1" fontSize="0.8em" colorScheme="gray" key={s}>
                {s}
              </Badge>
            ))}
          </Box>
          <Flex justify="start" my="3">
            {Array(currentTutor.avgRating)
              .fill(null)
              .map((_, i) => (
                <FaStar key={i} size={25} color="#ffbe0b" />
              ))}
            {Array(5 - currentTutor.avgRating)
              .fill(null)
              .map((_, i) => (
                <FaStar key={i} size={25} color="#e5e5e5" />
              ))}
          </Flex>
          <Text>
            <strong>Bio: </strong>
            {currentTutor.bio}
          </Text>
          <Flex direction="column" width="100%">
            <Button
              mt="3"
              variant="success"
              width="100%"
              leftIcon={<FaPersonBooth />}
              onClick={() => {
                user
                  ? push(`/tutors/${currentTutor._id}/sessions/new`)
                  : openSignInMenu();
              }}
            >
              Book session
            </Button>
            <Button
              mt="3"
              variant="primary"
              width="100%"
              leftIcon={<FaPen />}
              onClick={() => {
                user
                  ? push(`/tutors/${currentTutor._id}/posts/new`)
                  : openSignInMenu();
              }}
            >
              Create a Post
            </Button>
          </Flex>
          <Heading as="h2" size="md" my="3">
            Location
          </Heading>
          <Map
            initialViewState={{
              latitude: currentTutor.geometry?.coordinates[1],
              longitude: currentTutor.geometry?.coordinates[0],
              zoom: 7,
              bearing: 0,
              pitch: 0,
            }}
            style={{ height: '50vh', maxHeight: '500px' }}
            mapStyle={`mapbox://styles/mapbox/${colorMode}-v10`}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            testMode={true}
          >
            <Marker
              longitude={currentTutor.geometry!.coordinates[0]}
              latitude={currentTutor.geometry!.coordinates[1]}
              color={colors.primaryV3}
            />
          </Map>
        </GridItem>
        <GridItem colSpan={[2, null, null, 1]}>
          <Heading as="h2" size="md" mt={[5, null, 3, 0]}>
            Reviews
          </Heading>

          <ReviewsContextProvider
            reviews={currentTutor.reviews.map(r => ({
              ...r,
              ownerAuthenticated: userCreatedReviews.indexOf(r._id) !== -1,
            }))}
          >
            <ReviewContext.Consumer>
              {reviewsCtx => {
                const isNotTutor = user?._id !== currentTutor._id;
                const hasNotAlreadyReviewed = !reviewsCtx.reviews.some(r =>
                  userCreatedReviews.includes(r._id)
                );
                return (
                  <>
                    {user &&
                      hasNotAlreadyReviewed &&
                      isNotTutor &&
                      isUserAllowedToReview && (
                        <ReviewForm
                          type={ReviewFormTypes.Create}
                          tutorId={currentTutor._id}
                          addUserCreateReviewId={addUserCreateReviewId}
                        />
                      )}
                    {!isUserAllowedToReview && isNotTutor && (
                      <Flex alignItems="center" width="100%" my="5">
                        <FaPen size={20} />
                        <Heading as="h3" size="md" ml="3">
                          Have a Session or Post to review
                        </Heading>
                      </Flex>
                    )}
                    <VStack
                      overflowY="auto"
                      mt="3"
                      height={'400px'}
                      justify={reviewsCtx.reviews.length ? 'start' : 'center'}
                      alignItems={
                        reviewsCtx.reviews.length ? 'start' : 'center'
                      }
                    >
                      {reviewsCtx.reviews.length ? (
                        reviewsCtx.reviews.map((r: ReviewDocumentObject) => (
                          <Review
                            key={r._id}
                            review={r}
                            deleteUserCreateReviewId={deleteUserCreateReviewId}
                          />
                        ))
                      ) : (
                        <Heading
                          as="h2"
                          size="md"
                          textAlign="center"
                          fontWeight="normal"
                          color="gray.400"
                        >
                          Be the first to review!
                        </Heading>
                      )}
                    </VStack>
                  </>
                );
              }}
            </ReviewContext.Consumer>
          </ReviewsContextProvider>
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
  );
};

export default TutorPage;
