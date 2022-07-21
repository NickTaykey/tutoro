import type { TutorObjectGeoJSON } from '../../types/index';
import Link from 'next/link';
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
} from '@chakra-ui/react';

interface Props {
  popupInfo: TutorObjectGeoJSON;
  authenticatedTutor: boolean;
}

const TutorPopup: React.FC<Props> = ({ popupInfo, authenticatedTutor }) => {
  const subjects = authenticatedTutor
    ? popupInfo.properties.subjects
    : JSON.parse(popupInfo.properties.subjects as string);
  const avatar = authenticatedTutor
    ? popupInfo.properties.avatar?.url
    : JSON.parse(popupInfo.properties.avatar as string).url;
  return (
    <Box data-testid="popup-container" p="1">
      <Center>
        <Avatar
          src={avatar ? avatar : ''}
          name={popupInfo.properties.fullname}
        />
      </Center>
      <Heading as="h3" size="md" mt="3">
        {popupInfo.properties.fullname}
      </Heading>
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
        <Button colorScheme="gray" size="xs" width="100%">
          <Link
            href={`/tutors/${popupInfo.properties._id}`}
            style={{ fontWeight: 'bold' }}
          >
            Learn more
          </Link>
        </Button>
        {!authenticatedTutor && (
          <>
            <Button colorScheme="green" size="xs" width="100%">
              <Link href={`/tutors/${popupInfo.properties._id}/sessions/new`}>
                Book session
              </Link>
            </Button>
            <Button colorScheme="blue" size="xs" width="100%">
              <Link href={`/tutors/${popupInfo.properties._id}/posts/new`}>
                Create a Post
              </Link>
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default TutorPopup;
