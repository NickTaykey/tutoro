import { PostDocumentObject } from '../../models/Post';
import { PostType, PostStatus, CloudFile } from '../../types';
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
  Button,
  Tooltip,
} from '@chakra-ui/react';
import {
  FaArchive,
  FaArrowUp,
  FaExpandArrowsAlt,
  FaGlobe,
  FaPencilAlt,
  FaFile,
  FaImage,
  FaStar,
} from 'react-icons/fa';
import { MdError, MdOutlineAttachment } from 'react-icons/md';
import AnswerPostModal from './AnswerPostModal';
import type { AnswerPostModalHandler } from './AnswerPostModal';
import Link from 'next/link';
import colors from '../../theme/colors';

interface Props {
  post: PostDocumentObject;
  isLatestCreated: boolean;
  viewAsTutor: boolean;
  setSuccessAlert?: (alertContent: string) => void;
}

const Post: React.FC<Props> = ({
  post,
  viewAsTutor,
  setSuccessAlert,
  isLatestCreated,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const ctx = useContext(PostsContext);
  const { status, data } = useSession();
  const updatePostStatusHandler = () => {
    ctx.updatedPostStatus(
      post._id,
      post.answeredBy ? (post.answeredBy as UserDocumentObject)._id : 'global'
    );
  };
  const answerPostHandler = async (formData: FormData) => {
    const res = await ctx.answerPost(post._id, formData, currentUser._id);
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
            <ModalHeader>
              <Heading as="h1">Answer</Heading>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box mb="3">
                <Heading as="h2" size="md" mb="2">
                  Description
                </Heading>
                <Text maxHeight="40vh" pr="2" overflowY="auto">
                  {post.answer}
                </Text>
              </Box>
              {post.answerAttachments.length > 0 && (
                <Box mb="3">
                  <Heading as="h2" size="md" mb="2">
                    <Flex>
                      <MdOutlineAttachment size={25} fontWeight="light" />
                      <Text ml="1">Attachments</Text>
                    </Flex>
                  </Heading>
                  <Flex direction="column">
                    {post.attachments.map((f: CloudFile, i: number) => (
                      <Link href={f.url} key={f.public_id} passHref>
                        <Button
                          mb="3"
                          as="a"
                          textTransform="capitalize"
                          leftIcon={
                            f.url.includes('raw') ? (
                              <FaFile size={18} />
                            ) : (
                              <FaImage size={18} />
                            )
                          }
                        >
                          <>Attachment {i + 1}</>
                        </Button>
                      </Link>
                    ))}
                  </Flex>
                </Box>
              )}
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
        <Flex
          alignItems="center"
          direction={['column', 'row']}
          justify="space-between"
        >
          <Flex alignItems="center">
            {!viewAsTutor && post.type === PostType.SPECIFIC && (
              <Avatar
                src={answeredBy.avatar?.url}
                name={answeredBy.fullname}
                mx={[0, 2]}
              />
            )}
            {viewAsTutor && (
              <Avatar
                mx={[0, 2]}
                src={creator.avatar?.url}
                name={creator.fullname}
              />
            )}
            {!viewAsTutor &&
              post.type === PostType.GLOBAL &&
              post.status === PostStatus.ANSWERED && (
                <Avatar
                  src={(post.answeredBy as UserDocumentObject).avatar?.url}
                  name={(post.answeredBy as UserDocumentObject).fullname}
                  mx={[0, 2]}
                />
              )}
            <Heading as="h3" size="md" mx="2">
              {viewAsTutor ? (
                creator.fullname
              ) : post.type === PostType.GLOBAL &&
                post.status !== PostStatus.ANSWERED ? (
                <Flex alignItems="center">
                  <FaGlobe size="50" />
                  <Text mx="2">Global</Text>
                </Flex>
              ) : (
                answeredBy?.fullname
              )}
            </Heading>
            <Show below="sm">
              {isLatestCreated && post.checkoutCompleted && (
                <Box>
                  <FaStar size="25" color={colors.dangerV1} />
                </Box>
              )}
              {!post.checkoutCompleted && (
                <Box>
                  <MdError size="25" color={colors.dangerV1} />
                </Box>
              )}
            </Show>
          </Flex>
          <Flex my="3" alignItems="center">
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
        <Flex alignItems="center">
          <Show above="sm">
            {isLatestCreated && post.checkoutCompleted && (
              <Box>
                <FaStar size="25" color={colors.dangerV1} />
              </Box>
            )}
            {!post.checkoutCompleted && (
              <Tooltip
                hasArrow
                textAlign="center"
                p="3"
                label="The Post was not created because you did not complete the checkout process"
                bg="red.100"
                color="red.500"
              >
                <Box>
                  <MdError size="25" color={colors.dangerV1} />
                </Box>
              </Tooltip>
            )}
          </Show>
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
      </Flex>
      <Text mb="3" mt={[0, 3]} textAlign="justify">
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
      <Flex justifyContent="space-between" direction={['column', 'row']}>
        <Box>
          <strong>Date: </strong>
          <time dateTime={post.createdAt!.toString()}>
            {post.createdAt!.toString()}
          </time>
        </Box>
        <Flex direction="column" mt={[4, 0]}>
          <Flex mb="1">
            <MdOutlineAttachment size={25} fontWeight="light" />
            <Text ml="2" fontWeight="bold">
              {post.attachments.length} Post attachments
            </Text>
          </Flex>
          {post.status === PostStatus.ANSWERED && (
            <Flex mb="1">
              <MdOutlineAttachment size={25} fontWeight="light" />
              <Text ml="2" fontWeight="bold">
                {post.attachments.length} Answer attachments
              </Text>
            </Flex>
          )}
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
                variant="primary"
                icon={<FaArrowUp />}
              />
            )}
            {viewAsTutor && post.status !== PostStatus.CLOSED && (
              <>
                <IconButton
                  variant="success"
                  aria-label="answer post"
                  icon={<FaPencilAlt />}
                  mr={[0, 3]}
                  mb={[3, 0]}
                  onClick={() => imperativeHandlingRef.current?.onOpen()}
                />
                <IconButton
                  onClick={updatePostStatusHandler}
                  aria-label="close post"
                  variant="danger"
                  icon={<FaArchive />}
                  mr={[0, 3]}
                  mb={[3, 0]}
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
