import ReviewForm, { ReviewFormTypes } from '../reviews/ReviewForm';
import ReviewsContextProvider from '../../store/ReviewsProvider';
import ReviewContext from '../../store/reviews-context';
import Review from '../reviews/Review';
import Map, { Marker } from 'react-map-gl';
import AuthenticatedUserContext from '../../store/authenticated-user-context';
import { useContext } from 'react';
import { useRouter } from 'next/router';
import {
  Heading,
  Flex,
  Text,
  VStack,
  Badge,
  Grid,
  GridItem,
  Box,
  Button,
  Avatar,
  useColorMode,
} from '@chakra-ui/react';
import { FaPen, FaPersonBooth, FaStar } from 'react-icons/fa';
import colors from '../../theme/colors';
import Banner404 from '../global/404';
import type { ReviewDocumentObject } from '../../models/Review';
import type { UserDocumentObject } from '../../models/User';

interface Props {
  tutor?: UserDocumentObject;
  isUserAllowedToReview: boolean;
}

const TutorPage: React.FC<Props> = ({
  tutor,
  isUserAllowedToReview,
}: Props) => {
  const { user, openSignInMenu } = useContext(AuthenticatedUserContext);
  const currentTutor = user?._id === tutor?._id ? user! : tutor!;
  const { colorMode } = useColorMode();
  const { push } = useRouter();

  return tutor ? (
    <Box width="90%" mx="auto">
      <Flex alignItems="center">
        <Avatar
          src={currentTutor.avatar?.url ? currentTutor.avatar.url : ''}
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
              latitude: currentTutor.geometry!.coordinates[1],
              longitude: currentTutor.geometry!.coordinates[0],
              zoom: 7,
              bearing: 0,
              pitch: 0,
            }}
            style={{ height: '50vh', maxHeight: '500px' }}
            mapStyle={`mapbox://styles/mapbox/${colorMode}-v10`}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
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
          <ReviewsContextProvider reviews={currentTutor.reviews}>
            <ReviewContext.Consumer>
              {reviewsCtx => {
                const reviewsStackAlignment = reviewsCtx.reviews.length
                  ? 'start'
                  : 'center';
                return (
                  <>
                    <ReviewForm
                      type={ReviewFormTypes.Create}
                      tutorId={currentTutor._id}
                    />
                    {!isUserAllowedToReview && user?._id !== currentTutor._id && (
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
                      height="400px"
                      justify={reviewsStackAlignment}
                      alignItems={reviewsStackAlignment}
                    >
                      {reviewsCtx.reviews.length ? (
                        reviewsCtx.reviews.map((r: ReviewDocumentObject) => (
                          <Review key={r._id} review={r} />
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
    <Banner404 message="Tutor not found" />
  );
};

export default TutorPage;
