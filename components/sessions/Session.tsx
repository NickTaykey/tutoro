import {
  Avatar,
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  IconButton,
  Tooltip,
  Show,
} from '@chakra-ui/react';
import { useContext, useState } from 'react';
import { FaArchive, FaArrowUp, FaCheck, FaStar } from 'react-icons/fa';
import { MdError } from 'react-icons/md';
import type { SessionDocumentObject } from '../../models/Session';
import type { UserDocumentObject } from '../../models/User';
import SessionsContext from '../../store/sessions-context';
import colors from '../../theme/colors';
import { SessionStatus } from '../../types';

interface Props {
  session: SessionDocumentObject;
  viewAsTutor: boolean;
  isLatestCreated: boolean;
}

const Session: React.FC<Props> = ({
  session,
  viewAsTutor,
  isLatestCreated,
}) => {
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
    <Box shadow="md" borderWidth="1px" p="6" width="100%" borderRadius="md">
      <Flex
        direction={['column', 'row']}
        justifyContent="space-between"
        alignItems="center"
      >
        <Flex alignItems="center" direction={['column', 'row']}>
          <Flex alignItems="center">
            <Avatar
              src={
                viewAsTutor
                  ? (session.user as UserDocumentObject).avatar?.url
                  : tutor.avatar?.url
              }
              name={
                viewAsTutor
                  ? (session.user as UserDocumentObject).fullname
                  : tutor.fullname
              }
            />
            <Heading as="h3" size="md" mx="1">
              {viewAsTutor ? user.fullname : tutor.fullname}
            </Heading>
            <Show below="sm">
              {isLatestCreated && session.checkoutCompleted && (
                <FaStar size="25" color={colors.dangerV1} />
              )}
              {!session.checkoutCompleted && (
                <MdError size="25" color={colors.dangerV1} />
              )}
            </Show>
          </Flex>
          <Flex my="3">
            <Badge fontSize="0.8em" bg="purple.600" color="white" ml="3">
              {session.subject}
            </Badge>
            <Badge
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
        </Flex>
        <Show above="sm">
          {isLatestCreated && session.checkoutCompleted && (
            <Box>
              <FaStar size="25" color={colors.dangerV1} />
            </Box>
          )}
          {!session.checkoutCompleted && (
            <Tooltip
              hasArrow
              textAlign="center"
              p="3"
              label="The Session was not booked because you did not complete the checkout process"
              bg="red.100"
              color="red.500"
            >
              <Box>
                <MdError size="25" color={colors.dangerV1} />
              </Box>
            </Tooltip>
          )}
        </Show>
      </Flex>
      <Text mb="3" mt={[0, 3]}>
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
      <Flex mt="3" direction={['column', 'row']}>
        {viewAsTutor && session.status === SessionStatus.REJECTED && (
          <IconButton
            onClick={resetSessionHandler}
            aria-label="reset session status"
            variant="primary"
            icon={<FaArrowUp />}
          />
        )}
        {viewAsTutor && session.status === SessionStatus.NOT_APPROVED && (
          <IconButton
            aria-label="approve session"
            variant="success"
            onClick={approveSessionHandler}
            icon={<FaCheck />}
            mb={[1, 0]}
            mr={[0, 1]}
          />
        )}
        {viewAsTutor && session.status !== SessionStatus.REJECTED && (
          <IconButton
            aria-label="reject session"
            variant="danger"
            onClick={rejectSessionHandler}
            icon={<FaArchive />}
            mb={[1, 0]}
            mr={[0, 1]}
          />
        )}
      </Flex>
    </Box>
  );
};

export default Session;
