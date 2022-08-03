import ReviewForm, { ReviewFormTypes } from '../reviews/ReviewForm';
import ReviewsContextProvider from '../../store/ReviewsProvider';
import ReviewContext from '../../store/reviews-context';
import Review from '../reviews/Review';
import Map, { Marker } from 'react-map-gl';
import AuthenticatedUserContext from '../../store/authenticated-user-context';
import { useContext } from 'react';
import { useRouter } from 'next/router';
import * as c from '@chakra-ui/react';
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
  const { colorMode } = c.useColorMode();
  const { push } = useRouter();

  return tutor ? (
    <c.Box width="90%" mx="auto">
      <c.Flex alignItems="center">
        <c.Avatar
          size="xl"
          src={currentTutor.avatar?.url ? currentTutor.avatar.url : ''}
          name={currentTutor.fullname}
        />
        <c.Heading as="h1" size="xl" my="5" ml="4">
          {currentTutor.fullname}
        </c.Heading>
      </c.Flex>
      <c.Grid templateColumns="repeat(2, 1fr)" columnGap="4" my="4">
        <c.GridItem colSpan={[2, null, null, 1]}>
          <c.Box>
            <strong>Tutor in: </strong>
            {currentTutor.subjects.map(s => (
              <c.Badge mr="1" fontSize="0.8em" colorScheme="gray" key={s}>
                {s}
              </c.Badge>
            ))}
          </c.Box>
          <c.Flex justify="start" my="3">
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
          </c.Flex>
          <c.Text>
            <strong>Bio: </strong>
            {currentTutor.bio}
          </c.Text>
          <c.Flex direction="column" width="100%">
            <c.Button
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
            </c.Button>
            <c.Button
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
            </c.Button>
          </c.Flex>
          <c.Heading as="h2" size="md" my="3">
            Location
          </c.Heading>
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
        </c.GridItem>
        <c.GridItem colSpan={[2, null, null, 1]}>
          <c.Heading as="h2" size="md" mt={[5, null, 3, 0]}>
            Reviews
          </c.Heading>
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
                    <c.VStack
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
                        <c.Heading
                          as="h2"
                          size="md"
                          textAlign="center"
                          fontWeight="normal"
                          color="gray.400"
                        >
                          Be the first to review!
                        </c.Heading>
                      )}
                    </c.VStack>
                  </>
                );
              }}
            </ReviewContext.Consumer>
          </ReviewsContextProvider>
        </c.GridItem>
      </c.Grid>
    </c.Box>
  ) : (
    <Banner404 message="Tutor not found" />
  );
};

export default TutorPage;
