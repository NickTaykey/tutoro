import { PostDocumentObject } from '../../models/Post';
import { PostType, PostStatus } from '../../types';
import { useContext, useRef, useState } from 'react';
import PostsContext, { APIError } from '../../store/posts-context';
import { useSession } from 'next-auth/react';
import { UserDocumentObject } from '../../models/User';
import {
  Avatar,
  Badge,
  Box,
  Flex,
  Heading,
  IconButton,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Show,
} from '@chakra-ui/react';
import {
  FaArchive,
  FaArrowUp,
  FaExpandArrowsAlt,
  FaFile,
  FaGlobe,
  FaPencilAlt,
} from 'react-icons/fa';
import AnswerPostModal, { AnswerPostModalHandler } from './AnswerPostModal';

interface Props {
  post: PostDocumentObject;
  viewAsTutor: boolean;
  setSuccessAlert?: (alertContent: string) => void;
}

const Post: React.FC<Props> = ({ post, viewAsTutor, setSuccessAlert }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const ctx = useContext(PostsContext);
  const { status, data } = useSession();
  const updatePostStatusHandler = () => {
    ctx.updatedPostStatus(
      post._id,
      post.answeredBy ? (post.answeredBy as UserDocumentObject)._id : 'global'
    );
  };
  const answerPostHandler = async (answer: string) => {
    const res = await ctx.answerPost(post._id, answer, currentUser._id);
    if ((res as APIError).errorMessage) {
      imperativeHandlingRef.current?.setValidationError(
        (res as APIError).errorMessage
      );
    }
    if (setSuccessAlert) setSuccessAlert('Post successfully answered!');
    imperativeHandlingRef.current?.onClose();
  };

  const currentUser = data?.user as unknown as UserDocumentObject;
  const creator = post.creator as UserDocumentObject;
  const answeredBy = post.answeredBy as UserDocumentObject;
  const [showFullPostDescription, setShowFullPostDescription] =
    useState<boolean>(false);
  const imperativeHandlingRef = useRef<AnswerPostModalHandler>(null);
  return (
    <Box shadow="md" borderWidth="1px" p="6" width="100%" borderRadius="md">
      {post.answer ? (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent py="6" width="90%">
            <ModalHeader>Your answer</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text maxHeight="40vh" pr="2" overflowY="auto">
                {post.answer}
              </Text>
            </ModalBody>
          </ModalContent>
        </Modal>
      ) : (
        <AnswerPostModal
          ref={imperativeHandlingRef}
          post={post}
          setAnswer={answerPostHandler}
        />
      )}
      <Flex
        direction={['column', 'row']}
        alignItems="center"
        justifyContent="space-between"
      >
        <Flex alignItems="center" direction={['column', 'row']}>
          <Flex alignItems="center">
            {post.type === PostType.SPECIFIC && !viewAsTutor && (
              <Avatar src={answeredBy.avatar?.url} name={answeredBy.fullname} />
            )}
            {post.type === PostType.SPECIFIC && viewAsTutor && (
              <Avatar src={creator.avatar?.url} name={creator.fullname} />
            )}
            <Heading
              as="h3"
              size="md"
              ml={post.type === PostType.GLOBAL ? 0 : 3}
            >
              {status !== 'loading' && viewAsTutor ? (
                creator.fullname
              ) : post.type === PostType.GLOBAL ? (
                <Flex alignItems="center">
                  <FaGlobe size="50" />
                  <Text ml="3">Global</Text>
                </Flex>
              ) : (
                answeredBy?.fullname
              )}
            </Heading>
          </Flex>
          <Flex my="3">
            <Badge fontSize="0.8em" bg="purple.600" color="white" ml="3">
              {post.subject}
            </Badge>
            <Badge
              fontSize="0.8em"
              colorScheme={
                post.status === PostStatus.ANSWERED
                  ? 'green'
                  : post.status === PostStatus.CLOSED
                  ? 'red'
                  : 'gray'
              }
              ml="3"
            >
              {post.status === PostStatus.ANSWERED
                ? 'Answered!'
                : post.status === PostStatus.CLOSED
                ? 'Closed'
                : 'Not answered!'}
            </Badge>
          </Flex>
        </Flex>
        {post.answer && (
          <Show above="sm">
            <IconButton
              width={['100%', 'auto']}
              ml={[0, 3]}
              aria-label="view tutor page"
              icon={<FaExpandArrowsAlt />}
              onClick={onOpen}
            />
          </Show>
        )}
      </Flex>
      <Text mb="3" mt={[0, 3]}>
        {showFullPostDescription || post.description.length < 100 ? (
          post.description
        ) : (
          <>
            {`${post.description.slice(0, 100)} ... `}
            <strong onClick={() => setShowFullPostDescription(true)}>
              View more
            </strong>
          </>
        )}
      </Text>
      <Flex alignItems="center" justifyContent="space-between">
        <Box>
          <strong>Date: </strong>
          <time dateTime={post.createdAt!.toString()}>
            {post.createdAt!.toString()}
          </time>
        </Box>
        <Flex>
          <FaFile size={25} />
          <Text ml="2" fontWeight="bold">
            {post.attachments.length}
          </Text>
        </Flex>
      </Flex>
      {post.answer && (
        <Show below="sm">
          <IconButton
            width="100%"
            ml={[0, 3]}
            mt="3"
            aria-label="view tutor page"
            icon={<FaExpandArrowsAlt />}
            onClick={onOpen}
          />
        </Show>
      )}
      {/* {status !== 'loading' && post.status === PostStatus.ANSWERED && (
        <>
          <div>Answer:</div>
          <div>{post.answer}</div>
          <div>Answered by: {answeredBy.fullname}</div>
        </>
      )} */}
      {/* {!viewAsTutor &&
          status !== 'loading' &&
          post.status === PostStatus.CLOSED && (
            <div>
              Closed by {post.type === PostType.GLOBAL ? 'a' : 'the'} Tutor.
            </div>
          )} */}
      {post.status !== PostStatus.ANSWERED && (
        <>
          <Flex mt="3" direction={['column', 'row']}>
            {viewAsTutor && post.status === PostStatus.CLOSED && (
              <IconButton
                onClick={updatePostStatusHandler}
                aria-label="re-open post"
                colorScheme="blue"
                icon={<FaArrowUp />}
              />
            )}
            {viewAsTutor && post.status !== PostStatus.CLOSED && (
              <>
                <IconButton
                  colorScheme="green"
                  aria-label="answer post"
                  icon={<FaPencilAlt />}
                  mr={[0, 1]}
                  mb={[1, 0]}
                  onClick={() => imperativeHandlingRef.current?.onOpen()}
                />
                <IconButton
                  onClick={updatePostStatusHandler}
                  aria-label="close post"
                  colorScheme="red"
                  icon={<FaArchive />}
                  mr={[0, 1]}
                  mb={[1, 0]}
                />
              </>
            )}
          </Flex>
        </>
      )}
    </Box>
  );
};

export default Post;
