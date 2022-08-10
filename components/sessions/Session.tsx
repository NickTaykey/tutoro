import AuthenticatedUserContext from '../../store/authenticated-user-context';
import { FaArchive, FaArrowUp, FaCheck, FaStar } from 'react-icons/fa';
import { useCallback, useContext, useEffect, useState } from 'react';
import type { SessionDocumentObject } from '../../models/Session';
import type { UserDocumentObject } from '../../models/User';
import SessionsContext from '../../store/sessions-context';
import { SessionStatus } from '../../utils/types';
import { MdError } from 'react-icons/md';
import colors from '../../theme/colors';
import * as c from '@chakra-ui/react';
import Link from 'next/link';
import { Types } from 'ably';

interface Props {
  session: SessionDocumentObject;
  viewAsTutor: boolean;
  isLatestCreated: boolean;
  userChannel: Types.RealtimeChannelPromise | null;
}

const Session: React.FC<Props> = ({
  session,
  viewAsTutor,
  isLatestCreated,
  userChannel,
}) => {
  const { setSessionStatus } = useContext(SessionsContext);
  const { updateTutorProfile } = useContext(AuthenticatedUserContext);
  const [showFullTopic, setShowFullTopic] = useState<boolean>(false);
  const [sessionStatus, setSessionStatusState] = useState<SessionStatus>(
    session.status
  );

  let { tutor, user } = session;
  tutor = tutor as UserDocumentObject;
  user = user as UserDocumentObject;

  const { _id: tutorId, sessionEarnings } = tutor;

  useEffect(() => {
    if (!viewAsTutor && userChannel) {
      userChannel.subscribe(message => {
        if (message.name === `update-session-${session._id}-status`) {
          setSessionStatusState(message.data);
        }
      });
    }
    return () => {
      userChannel?.unsubscribe();
    };
  }, []);

  const channelHandler = useCallback(
    (publisher: () => void, onAttachedCb: () => void) => {
      publisher();
      onAttachedCb();
    },
    []
  );

  const approveSessionHandler = () => {
    channelHandler(
      async () => {
        await userChannel!.publish(
          `update-session-${session._id}-status`,
          SessionStatus.APPROVED
        );
      },
      () => {
        if (sessionStatus !== SessionStatus.APPROVED) {
          Promise.all([
            setSessionStatus(
              session._id,
              tutorId.toString(),
              SessionStatus.APPROVED
            ),
            updateTutorProfile({
              sessionEarnings: sessionEarnings + session.price,
            }),
          ]);
        }
      }
    );
  };

  const rejectSessionHandler = () => {
    channelHandler(
      async () => {
        await userChannel!.publish(
          `update-session-${session._id}-status`,
          SessionStatus.REJECTED
        );
      },
      () => {
        if (sessionStatus !== SessionStatus.REJECTED) {
          setSessionStatus(
            session._id,
            tutorId.toString(),
            SessionStatus.REJECTED
          );
        }
      }
    );
  };

  const resetSessionHandler = () => {
    channelHandler(
      async () => {
        await userChannel!.publish(
          `update-session-${session._id}-status`,
          SessionStatus.NOT_APPROVED
        );
      },
      () => {
        if (sessionStatus !== SessionStatus.NOT_APPROVED) {
          setSessionStatus(
            session._id,
            tutorId.toString(),
            SessionStatus.NOT_APPROVED
          );
        }
      }
    );
  };

  const date = new Date(session.date);
  const startHour = `${date.getHours()}:${date.getMinutes()}`;
  const endHour = `${date.getHours() + session.hours}:${date.getMinutes()}`;

  return (
    <c.Box shadow="md" borderWidth="1px" p="6" width="100%" borderRadius="md">
      <c.Flex
        direction={['column', 'row']}
        justifyContent="space-between"
        alignItems="center"
      >
        <c.Flex alignItems="center" direction={['column', 'row']}>
          <c.Flex alignItems="center">
            <Link href={`/tutors/${tutorId}`}>
              <c.Avatar
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
            </Link>
            <c.Heading as="h3" size="md" mx="3">
              {viewAsTutor ? user.fullname : tutor.fullname}
            </c.Heading>
            <c.Show below="sm">
              {isLatestCreated && session.checkoutCompleted && (
                <FaStar size="25" color={colors.dangerV1} />
              )}
              {!session.checkoutCompleted && (
                <MdError size="25" color={colors.dangerV1} />
              )}
            </c.Show>
          </c.Flex>
          <c.Flex my="3">
            <c.Badge fontSize="0.8em" bg="purple.600" color="white">
              {session.subject}
            </c.Badge>
            <c.Badge
              fontSize="0.8em"
              colorScheme={
                sessionStatus === SessionStatus.APPROVED
                  ? 'green'
                  : sessionStatus === SessionStatus.REJECTED
                  ? 'red'
                  : 'gray'
              }
              ml="3"
            >
              {sessionStatus === SessionStatus.APPROVED
                ? 'Approved!'
                : sessionStatus === SessionStatus.REJECTED
                ? 'Rejected'
                : 'Not approved!'}
            </c.Badge>
          </c.Flex>
        </c.Flex>
        <c.Show above="sm">
          {isLatestCreated && session.checkoutCompleted && (
            <c.Box>
              <FaStar size="25" color={colors.dangerV1} />
            </c.Box>
          )}
          {!session.checkoutCompleted && (
            <c.Tooltip
              hasArrow
              textAlign="center"
              p="3"
              label="The Session was not booked because you did not complete the checkout process"
              bg="red.100"
              color="red.500"
            >
              <c.Box>
                <MdError size="25" color={colors.dangerV1} />
              </c.Box>
            </c.Tooltip>
          )}
        </c.Show>
      </c.Flex>
      <c.Text mb="3" mt={[0, 3]}>
        {showFullTopic || session.topic.length < 100 ? (
          session.topic
        ) : (
          <>
            {`${session.topic.slice(0, 100)} ... `}
            <strong onClick={() => setShowFullTopic(true)}>View more</strong>
          </>
        )}
      </c.Text>
      <c.Box>
        <strong>Date: </strong>
        <time dateTime={session.date.toString()}>
          {session.date
            .toString()
            .slice(0, session.date.toString().length === 10 ? 10 : 9)}
        </time>
      </c.Box>
      <c.Text mb="3">
        <strong>Hours: </strong>
        {startHour} - {endHour}
      </c.Text>
      <c.Flex mt="3" direction={['column', 'row']}>
        {viewAsTutor && sessionStatus === SessionStatus.REJECTED && (
          <c.IconButton
            onClick={resetSessionHandler}
            aria-label="reset session status"
            variant="primary"
            icon={<FaArrowUp />}
          />
        )}
        {viewAsTutor && sessionStatus === SessionStatus.NOT_APPROVED && (
          <c.IconButton
            aria-label="approve session"
            variant="success"
            onClick={approveSessionHandler}
            icon={<FaCheck />}
            mb={[1, 0]}
            mr={[0, 3]}
          />
        )}
        {viewAsTutor && sessionStatus !== SessionStatus.REJECTED && (
          <c.IconButton
            aria-label="reject session"
            variant="danger"
            onClick={rejectSessionHandler}
            icon={<FaArchive />}
            mb={[1, 0]}
            mr={[0, 3]}
          />
        )}
      </c.Flex>
    </c.Box>
  );
};

export default Session;
