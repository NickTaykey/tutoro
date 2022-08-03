import type { TutorObjectGeoJSON } from '../../types';
import { FaStar } from 'react-icons/fa';
import * as c from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import AuthenticatedUserContext from '../../store/authenticated-user-context';
import Link from 'next/link';

interface Props {
  popupInfo: TutorObjectGeoJSON;
  authenticatedTutor: boolean;
}

const TutorPopup: React.FC<Props> = ({ popupInfo, authenticatedTutor }) => {
  const { push } = useRouter();
  const { user, openSignInMenu } = useContext(AuthenticatedUserContext);
  const popupBgColor = c.useColorModeValue('gray.50', 'gray.700');

  const subjects = authenticatedTutor
    ? popupInfo.properties.subjects
    : JSON.parse(popupInfo.properties.subjects as string);
  const avatar = authenticatedTutor
    ? popupInfo.properties.avatar?.url
    : JSON.parse(popupInfo.properties.avatar as string).url;

  return (
    <c.Box data-testid="popup-container" p="1" bgColor={popupBgColor}>
      <c.Center>
        <Link href={`/tutors/${popupInfo.properties._id}`}>
          <c.Avatar
            src={avatar ? avatar : ''}
            name={popupInfo.properties.fullname}
          />
        </Link>
      </c.Center>
      <c.Heading as="h3" size="md" mt="3">
        {popupInfo.properties.fullname}
      </c.Heading>
      <c.Box my="4">
        <c.Heading as="h4" size="sm" mb="2">
          Session price €{popupInfo.properties.sessionPricePerHour}/h
        </c.Heading>
        <c.Heading as="h4" size="sm">
          Post price €{popupInfo.properties.pricePerPost}
        </c.Heading>
      </c.Box>
      <c.Flex justify="start" my="3">
        {Array(popupInfo.properties.avgRating)
          .fill(null)
          .map((_, i) => (
            <FaStar key={i} color="#ffbe0b" />
          ))}
        {Array(5 - popupInfo.properties.avgRating)
          .fill(null)
          .map((_, i) => (
            <FaStar key={i} color="#e5e5e5" />
          ))}
      </c.Flex>
      <c.Text mb="3">{popupInfo.properties.reviews.length} Reviews</c.Text>
      <c.Box mb="3">
        <c.Text size="md" fontWeight="bold">
          Subjects
        </c.Text>
        <c.UnorderedList>
          {subjects.map((s: string) => (
            <c.ListItem key={s}>{s}</c.ListItem>
          ))}
        </c.UnorderedList>
      </c.Box>
      <c.VStack>
        <c.Button
          colorScheme="gray"
          size="xs"
          width="100%"
          onClick={() => push(`/tutors/${popupInfo.properties._id}`)}
        >
          Learn more
        </c.Button>
        {!authenticatedTutor && (
          <>
            <c.Button
              colorScheme="green"
              size="xs"
              width="100%"
              onClick={() => {
                user
                  ? push(`/tutors/${popupInfo.properties._id}/sessions/new`)
                  : openSignInMenu();
              }}
            >
              Book session
            </c.Button>
            <c.Button
              colorScheme="blue"
              size="xs"
              width="100%"
              onClick={() => {
                user
                  ? push(`/tutors/${popupInfo.properties._id}/posts/new`)
                  : openSignInMenu();
              }}
            >
              Create a Post
            </c.Button>
          </>
        )}
      </c.VStack>
    </c.Box>
  );
};

export default TutorPopup;
