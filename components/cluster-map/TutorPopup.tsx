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
} from '@chakra-ui/react';

interface Props {
  popupInfo: TutorObjectGeoJSON;
  authenticatedTutor: boolean;
}

const TutorPopup: React.FC<Props> = ({ popupInfo, authenticatedTutor }) => {
  return (
    <Box data-testid="popup-container">
      <Heading as="h3" size="md" mt="4">
        {popupInfo.properties.fullname}
      </Heading>
      <Flex justify="space-between" alignItems="baseline" my="1">
        <Flex justify="start">
          {Array(popupInfo.properties.avgRating)
            .fill(null)
            .map((_, i) => (
              <FaStar key={i} />
            ))}
        </Flex>
        <Text>{popupInfo.properties.reviews.length} Reviews</Text>
      </Flex>
      <Box mb="1">
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
      <Text fontWeight="bold">
        <Link href={`/tutors/${popupInfo.properties._id}`}>Learn more</Link>
      </Text>
      {/* <br />
    {!authenticatedTutor && (
      <>
        <Link href={`/tutors/${popupInfo.properties._id}/sessions/new`}>
          Book session
        </Link>
        <br />
        <Link href={`/tutors/${popupInfo.properties._id}/new-post`}>
          Ask a question
        </Link>
      </>
    )} */}
    </Box>
  );
};

export default TutorPopup;
