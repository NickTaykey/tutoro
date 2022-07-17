import {
  Avatar,
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  IconButton,
} from '@chakra-ui/react';
import { useContext, useState } from 'react';
import { FaArrowUp, FaCheck, FaRegTimesCircle } from 'react-icons/fa';
import type { SessionDocumentObject } from '../../models/Session';
import type { UserDocumentObject } from '../../models/User';
import SessionsContext from '../../store/sessions-context';
import { SessionStatus } from '../../types';

interface Props {
  session: SessionDocumentObject;
  viewAsTutor: boolean;
}

const Session: React.FC<Props> = ({ session, viewAsTutor }) => {
  const ctx = useContext(SessionsContext);
  const [showFullTopic, setShowFullTopic] = useState<boolean>(false);
  let { tutor, user } = session;
  const { _id: tutorId } = tutor as UserDocumentObject;
  tutor = tutor as UserDocumentObject;
  user = user as UserDocumentObject;

  const approveSessionHandler = () => {
    ctx.setSessionStatus(
      session._id,
      tutorId.toString(),
      SessionStatus.APPROVED
    );
  };

  const rejectSessionHandler = () => {
    ctx.setSessionStatus(
      session._id,
      tutorId.toString(),
      SessionStatus.REJECTED
    );
  };

  const resetSessionHandler = () => {
    ctx.setSessionStatus(
      session._id,
      tutorId.toString(),
      SessionStatus.NOT_APPROVED
    );
  };

  const date = new Date(session.date);
  const startHour = `${date.getHours()}:${date.getMinutes()}`;
  const endHour = `${date.getHours() + session.hours}:${date.getMinutes()}`;

  return (
    <Box shadow="md" borderWidth="1px" p="6" width="100%">
      <Flex alignItems="center" direction={['column', 'row']}>
        <Avatar
          src={
            viewAsTutor
              ? (session.user as UserDocumentObject).avatar
              : tutor.avatar
          }
          name={
            viewAsTutor
              ? (session.user as UserDocumentObject).avatar
              : tutor.fullname
          }
        />
        <Heading as="h3" size="md" ml="3" mt={[3, 0, 0, 0, 0]}>
          {viewAsTutor ? user.fullname : tutor.fullname}
        </Heading>
        <Badge
          fontSize="0.8em"
          bg="purple.600"
          color="white"
          ml="3"
          mt={[3, 0, 0, 0, 0]}
        >
          {session.subject}
        </Badge>
        <Badge
          mt={[3, 0, 0, 0, 0]}
          fontSize="0.8em"
          colorScheme={
            session.status === SessionStatus.APPROVED
              ? 'green'
              : session.status === SessionStatus.REJECTED
              ? 'red'
              : 'gray'
          }
          ml="3"
        >
          {session.status === SessionStatus.APPROVED
            ? 'Approved!'
            : session.status === SessionStatus.REJECTED
            ? 'Rejected'
            : 'Not approved!'}
        </Badge>
      </Flex>
      <Text my="3">
        {showFullTopic || session.topic.length < 100 ? (
          session.topic
        ) : (
          <>
            {`${session.topic.slice(0, 100)} ... `}
            <strong onClick={() => setShowFullTopic(true)}>View more</strong>
          </>
        )}
      </Text>
      <Box>
        <strong>Date: </strong>
        <time dateTime={session.date.toString()}>
          {session.date
            .toString()
            .slice(0, session.date.toString().length === 10 ? 10 : 9)}
        </time>
      </Box>
      <Text mb="3">
        <strong>Hours: </strong>
        {startHour} - {endHour}
      </Text>
      {viewAsTutor && session.status === SessionStatus.REJECTED && (
        <IconButton
          onClick={resetSessionHandler}
          aria-label="reset session status"
          colorScheme="blue"
          icon={<FaArrowUp />}
        />
      )}
      {viewAsTutor && session.status !== SessionStatus.REJECTED && (
        <IconButton
          aria-label="reject session"
          colorScheme="red"
          onClick={rejectSessionHandler}
          icon={<FaRegTimesCircle size={25} />}
          mb={[1, 0]}
          mr={[0, 1]}
        />
      )}
      {viewAsTutor && session.status === SessionStatus.NOT_APPROVED && (
        <IconButton
          aria-label="approve session"
          colorScheme="green"
          onClick={approveSessionHandler}
          icon={<FaCheck size={25} />}
          mb={[1, 0]}
          mr={[0, 1]}
        />
      )}
    </Box>
  );
};

export default Session;
