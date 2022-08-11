import AuthenticatedUserContext from '../../store/authenticated-user-context';
import {
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { PostType, PostStatus, CloudFile } from '../../utils/types';
import { MdError, MdOutlineAttachment } from 'react-icons/md';
import PostsContext from '../../store/posts-context';
import AnswerPostModal from './AnswerPostModal';
import colors from '../../theme/colors';
import * as c from '@chakra-ui/react';
import * as fa from 'react-icons/fa';
import Link from 'next/link';

import type { PostDocument, PostDocumentObject } from '../../models/Post';
import type { AnswerPostModalHandler } from './AnswerPostModal';
import type { UserDocumentObject } from '../../models/User';
import type { APIError } from '../../store/posts-context';
import type { Types } from 'ably';

type PostAnswer = {
  answer: string;
  answeredBy: { fullname?: string; avatar?: CloudFile } | null;
  answerAttachments: CloudFile[];
};

interface Props {
  post: PostDocumentObject;
  isLatestCreated: boolean;
  viewAsTutor?: boolean;
  setSuccessAlert: (alertContent: string) => void;
  userChannel: Types.RealtimeChannelPromise | null;
}

const Post: React.FC<Props> = ({
  post,
  viewAsTutor,
  userChannel,
  setSuccessAlert,
  isLatestCreated,
}) => {
  const { user: currentUser } = useContext(AuthenticatedUserContext);
  const creator = post.creator as UserDocumentObject;
  const answeredBy = post.answeredBy
    ? (post.answeredBy as UserDocumentObject)
    : null;
  const tutorId = answeredBy ? answeredBy._id : null;
  const imperativeHandlingRef = useRef<AnswerPostModalHandler>(null);

  const {
    isOpen: showFullPostDescription,
    onOpen: setShowFullPostDescription,
  } = c.useDisclosure();

  const { isOpen, onOpen, onClose } = c.useDisclosure();
  const { updateTutorProfile, user } = useContext(AuthenticatedUserContext);
  const { updatedPostStatus, answerPost } = useContext(PostsContext);
  const [postStatus, setPostStatusState] = useState<PostStatus>(post.status);
  const [postAnswer, setPostAnswerState] = useState<PostAnswer>({
    answer: post.answer,
    answeredBy: { fullname: answeredBy?.fullname, avatar: answeredBy?.avatar },
    answerAttachments: post.answerAttachments,
  });

  const channelHandler = useCallback(
    (publisher: () => void, onAttachedCb: () => void) => {
      publisher();
      onAttachedCb();
    },
    []
  );

  const updatePostStatusHandler = () => {
    channelHandler(
      async () => {
        await userChannel!.publish(
          `update-post-${post._id}-status`,
          postStatus === PostStatus.CLOSED
            ? PostStatus.NOT_ANSWERED
            : PostStatus.CLOSED
        );
      },
      () => {
        updatedPostStatus(
          post._id,
          post.answeredBy
            ? (post.answeredBy as UserDocumentObject)._id
            : 'global'
        );
      }
    );
  };

  useEffect(() => {
    if (!viewAsTutor && userChannel) {
      userChannel.subscribe(message => {
        if (message.name === `update-post-${post._id}-status`) {
          setPostStatusState(message.data);
          return;
        }
        if (message.name === `post-${post._id}-answer`) {
          setSuccessAlert('One of your posts has been answered!');
          setPostStatusState(PostStatus.ANSWERED);
          const { fullname, avatar } = message.data.answeredBy;
          setPostAnswerState({
            answer: message.data.answer,
            answeredBy: { fullname, avatar },
            answerAttachments: message.data.answerAttachments,
          });
          return;
        }
      });
    }
    return () => {
      userChannel?.unsubscribe();
    };
  }, []);

  const postCreatedAt = useMemo(
    () => new Date(post.createdAt!.toString()).toLocaleDateString(),
    [post.createdAt]
  );

  const answerPostHandler = async (formData: FormData) => {
    const res = await answerPost(post._id, formData, currentUser!._id);
    const { errorMessage } = res as APIError;
    if (errorMessage) {
      imperativeHandlingRef.current?.setValidationError(errorMessage);
    } else {
      const updatedPost = res as PostDocumentObject;
      const { answer, answerAttachments } = updatedPost;
      const answeredBy = updatedPost.answeredBy as UserDocumentObject;
      updateTutorProfile({
        postEarnings: user?.postEarnings! + (res as PostDocument).price,
      });
      userChannel?.publish(`post-${post._id}-answer`, {
        answerAttachments,
        answeredBy: {
          fullname: answeredBy.fullname,
          avatar: answeredBy.avatar,
        },
        answer,
      });
    }
    setSuccessAlert('Post successfully answered!');
    imperativeHandlingRef.current?.onClose();
  };

  return (
    <c.Box shadow="md" borderWidth="1px" p="6" width="100%" borderRadius="md">
      {postAnswer.answer ? (
        <c.Modal isOpen={isOpen} onClose={onClose} isCentered>
          <c.ModalOverlay />
          <c.ModalContent py="6" width="90%">
            <c.ModalHeader>
              <c.Heading as="h2">Answer</c.Heading>
            </c.ModalHeader>
            <c.ModalCloseButton />
            <c.ModalBody>
              <c.Box mb="3">
                <c.Heading as="h2" size="md" mb="2">
                  Description
                </c.Heading>
                <c.Text
                  maxHeight="40vh"
                  pr="2"
                  overflowY="auto"
                  textAlign="justify"
                >
                  {postAnswer.answer}
                </c.Text>
              </c.Box>
              {postAnswer.answerAttachments.length > 0 && (
                <c.Box mb="3">
                  <c.Heading as="h2" size="md" mb="2">
                    <c.Flex>
                      <MdOutlineAttachment size={25} fontWeight="light" />
                      <c.Text ml="1">Attachments</c.Text>
                    </c.Flex>
                  </c.Heading>
                  <c.Flex direction="column">
                    {postAnswer.answerAttachments.map(
                      (f: CloudFile, i: number) => (
                        <Link href={f.url} key={f.public_id} passHref>
                          <c.Button
                            mb="3"
                            as="a"
                            textTransform="capitalize"
                            leftIcon={
                              f.url.includes('raw') ? (
                                <fa.FaFile size={18} />
                              ) : (
                                <fa.FaImage size={18} />
                              )
                            }
                          >
                            <>Attachment {i + 1}</>
                          </c.Button>
                        </Link>
                      )
                    )}
                  </c.Flex>
                </c.Box>
              )}
            </c.ModalBody>
          </c.ModalContent>
        </c.Modal>
      ) : (
        <AnswerPostModal
          ref={imperativeHandlingRef}
          post={post}
          setAnswer={answerPostHandler}
        />
      )}
      <c.Flex
        direction={['column', 'row']}
        alignItems="center"
        justifyContent="space-between"
      >
        <c.Flex
          alignItems="center"
          direction={['column', 'row']}
          justify="space-between"
        >
          <c.Flex alignItems="center">
            {!viewAsTutor && postAnswer.answeredBy?.fullname && (
              <Link href={`/tutors/${tutorId}`}>
                <c.Avatar
                  src={postAnswer.answeredBy?.avatar?.url}
                  name={postAnswer.answeredBy?.fullname}
                  mx={[0, 2]}
                />
              </Link>
            )}
            {viewAsTutor && (
              <c.Avatar
                mx={[0, 2]}
                src={creator.avatar?.url}
                name={creator.fullname}
              />
            )}
            <c.Heading as="h3" size="md" mx="2">
              {viewAsTutor ? (
                creator.fullname
              ) : post.type === PostType.GLOBAL &&
                postStatus !== PostStatus.ANSWERED ? (
                <c.Flex alignItems="center">
                  <fa.FaGlobe size="50" />
                  <c.Text ml="3">Global</c.Text>
                </c.Flex>
              ) : (
                postAnswer?.answeredBy?.fullname
              )}
            </c.Heading>
            <c.Show below="sm">
              {isLatestCreated && post.checkoutCompleted && (
                <c.Box>
                  <fa.FaStar size="25" color={colors.dangerV1} />
                </c.Box>
              )}
              {!post.checkoutCompleted && (
                <c.Box>
                  <MdError size="25" color={colors.dangerV1} />
                </c.Box>
              )}
            </c.Show>
          </c.Flex>
          <c.Flex my="3" alignItems="center">
            <c.Badge fontSize="0.8em" bg="purple.600" color="white" ml="3">
              {post.subject}
            </c.Badge>
            <c.Badge
              fontSize="0.8em"
              colorScheme={
                postStatus === PostStatus.ANSWERED
                  ? 'green'
                  : postStatus === PostStatus.CLOSED
                  ? 'red'
                  : 'gray'
              }
              ml="3"
            >
              {postStatus === PostStatus.ANSWERED
                ? 'Answered!'
                : postStatus === PostStatus.CLOSED
                ? 'Closed'
                : 'Not answered!'}
            </c.Badge>
          </c.Flex>
        </c.Flex>
        <c.Flex alignItems="center">
          <c.Show above="sm">
            {isLatestCreated && post.checkoutCompleted && (
              <c.Box>
                <fa.FaStar size="25" color={colors.dangerV1} />
              </c.Box>
            )}
            {!post.checkoutCompleted && (
              <c.Tooltip
                hasArrow
                textAlign="center"
                p="3"
                label="The Post was not created because you did not complete the checkout process"
                bg="red.100"
                color="red.500"
              >
                <c.Box>
                  <MdError size="25" color={colors.dangerV1} />
                </c.Box>
              </c.Tooltip>
            )}
          </c.Show>
          {postAnswer.answer && (
            <c.Show above="sm">
              <c.IconButton
                width={['100%', 'auto']}
                ml={[0, 3]}
                aria-label="view tutor page"
                icon={<fa.FaExpandArrowsAlt />}
                onClick={onOpen}
              />
            </c.Show>
          )}
        </c.Flex>
      </c.Flex>
      <c.Text mb="3" mt={[0, 3]} textAlign="justify">
        {showFullPostDescription || post.description.length < 100 ? (
          post.description
        ) : (
          <>
            {`${post.description.slice(0, 100)} ... `}
            <strong onClick={setShowFullPostDescription}>View more</strong>
          </>
        )}
      </c.Text>
      <c.Flex justifyContent="space-between" direction={['column', 'row']}>
        <c.Box>
          <strong>Date: </strong>
          <time dateTime={postCreatedAt}>{postCreatedAt}</time>
        </c.Box>
        <c.Flex direction="column" mt={[4, 0]}>
          <c.Flex mb="1">
            <MdOutlineAttachment size={25} fontWeight="light" />
            <c.Text ml="2" fontWeight="bold">
              {post.attachments.length} given attachments
            </c.Text>
          </c.Flex>
          {postStatus === PostStatus.ANSWERED && (
            <c.Flex mb="1">
              <MdOutlineAttachment size={25} fontWeight="light" />
              <c.Text ml="2" fontWeight="bold">
                {postAnswer.answerAttachments.length} answer attachments
              </c.Text>
            </c.Flex>
          )}
        </c.Flex>
      </c.Flex>
      {postAnswer.answer && (
        <c.Show below="sm">
          <c.IconButton
            width="100%"
            ml={[0, 3]}
            mt="3"
            aria-label="view tutor page"
            icon={<fa.FaExpandArrowsAlt />}
            onClick={onOpen}
          />
        </c.Show>
      )}
      {postStatus !== PostStatus.ANSWERED && (
        <>
          <c.Flex mt="3" direction={['column', 'row']}>
            {viewAsTutor && postStatus === PostStatus.CLOSED && (
              <c.IconButton
                onClick={updatePostStatusHandler}
                aria-label="re-open post"
                variant="primary"
                icon={<fa.FaArrowUp />}
              />
            )}
            {viewAsTutor && postStatus !== PostStatus.CLOSED && (
              <>
                <c.IconButton
                  variant="success"
                  aria-label="answer post"
                  icon={<fa.FaPencilAlt />}
                  mr={[0, 3]}
                  mb={[3, 0]}
                  onClick={() => imperativeHandlingRef.current?.onOpen()}
                />
                <c.IconButton
                  onClick={updatePostStatusHandler}
                  aria-label="close post"
                  variant="danger"
                  icon={<fa.FaArchive />}
                  mr={[0, 3]}
                  mb={[3, 0]}
                />
              </>
            )}
          </c.Flex>
        </>
      )}
    </c.Box>
  );
};

export default Post;
