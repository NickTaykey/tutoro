import type { TutorObjectGeoJSON } from '../../types/index';
import { FaStar } from 'react-icons/fa';
import {
  Flex,
  Heading,
  Box,
  Text,
  UnorderedList,
  ListItem,
  Button,
  VStack,
  Avatar,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';
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
  const subjects = authenticatedTutor
    ? popupInfo.properties.subjects
    : JSON.parse(popupInfo.properties.subjects as string);
  const avatar = authenticatedTutor
    ? popupInfo.properties.avatar?.url
    : JSON.parse(popupInfo.properties.avatar as string).url;
  const popupBgColor = useColorModeValue('gray.50', 'gray.700');
  return (
    <Box data-testid="popup-container" p="1" bgColor={popupBgColor}>
      <Center>
        <Link href={`/tutors/${popupInfo.properties._id}`}>
          <Avatar
            src={avatar ? avatar : ''}
            name={popupInfo.properties.fullname}
          />
        </Link>
      </Center>
      <Heading as="h3" size="md" mt="3">
        {popupInfo.properties.fullname}
      </Heading>
      <Box my="4">
        <Heading as="h4" size="sm" mb="2">
          Session price €{popupInfo.properties.sessionPricePerHour}/h
        </Heading>
        <Heading as="h4" size="sm">
          Post price €{popupInfo.properties.pricePerPost}
        </Heading>
      </Box>
      <Flex justify="start" my="3">
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
      </Flex>
      <Text mb="3">{popupInfo.properties.reviews.length} Reviews</Text>
      <Box mb="3">
        <Text size="md" fontWeight="bold">
          Subjects
        </Text>
        <UnorderedList>
          {subjects.map((s: string) => (
            <ListItem key={s}>{s}</ListItem>
          ))}
        </UnorderedList>
      </Box>
      <VStack>
        <Button
          colorScheme="gray"
          size="xs"
          width="100%"
          onClick={() => push(`/tutors/${popupInfo.properties._id}`)}
        >
          Learn more
        </Button>
        {!authenticatedTutor && (
          <>
            <Button
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
            </Button>
            <Button
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
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default TutorPopup;
