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
} from '@chakra-ui/react';

interface Props {
  popupInfo: TutorObjectGeoJSON;
  authenticatedTutor: boolean;
}

const TutorPopup: React.FC<Props> = ({ popupInfo, authenticatedTutor }) => {
  return (
    <Box data-testid="popup-container" p="1">
      <Heading as="h3" size="md" mt="5">
        {popupInfo.properties.fullname}
      </Heading>
      <Flex justify="start" my="3">
        {Array(popupInfo.properties.avgRating)
          .fill(null)
          .map((_, i) => (
            <FaStar key={i} />
          ))}
      </Flex>
      <Text mb="3">{popupInfo.properties.reviews.length} Reviews</Text>
      <Box mb="3">
        <Text size="md" fontWeight="bold">
          Subjects
        </Text>
        <UnorderedList>
          {JSON.parse(popupInfo.properties.subjects.toString()).map(
            (s: string) => (
              <ListItem key={s}>{s}</ListItem>
            )
          )}
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
                Ask a question
              </Link>
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default TutorPopup;
