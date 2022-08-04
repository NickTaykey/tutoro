import { useContext, useRef } from 'react';
import PostsContext from '../../store/posts-context';
import { useSession } from 'next-auth/react';
import * as c from '@chakra-ui/react';
import * as fa from 'react-icons/fa';
import { MdError, MdOutlineAttachment } from 'react-icons/md';
import AnswerPostModal from './AnswerPostModal';
import Link from 'next/link';
import colors from '../../theme/colors';
import AuthenticatedUserContext from '../../store/authenticated-user-context';
import type { AnswerPostModalHandler } from './AnswerPostModal';
import type { UserDocumentObject } from '../../models/User';
import type { APIError } from '../../store/posts-context';
import type { PostDocumentObject } from '../../models/Post';
import { PostType, PostStatus, CloudFile } from '../../utils/types';

interface Props {
  post: PostDocumentObject;
  isLatestCreated: boolean;
  viewAsTutor?: boolean;
  setSuccessAlert?: (alertContent: string) => void;
}

const Post: React.FC<Props> = ({
  post,
  viewAsTutor,
  setSuccessAlert,
  isLatestCreated,
}) => {
  const { isOpen, onOpen, onClose } = c.useDisclosure();
  const { updateTutorProfile, user } = useContext(AuthenticatedUserContext);
  const { updatedPostStatus, answerPost } = useContext(PostsContext);
  const { data } = useSession();

  const updatePostStatusHandler = () => {
    updatedPostStatus(
      post._id,
      post.answeredBy ? (post.answeredBy as UserDocumentObject)._id : 'global'
    );
  };

  const answerPostHandler = async (formData: FormData) => {
    const res = await answerPost(post._id, formData, currentUser._id);
    const { errorMessage } = res as APIError;
    if (errorMessage) {
      imperativeHandlingRef.current?.setValidationError(errorMessage);
    } else {
      updateTutorProfile({
        postEarnings: user?.postEarnings! + (res as PostDocumentObject).price,
      });
    }
    if (setSuccessAlert) setSuccessAlert('Post successfully answered!');
    imperativeHandlingRef.current?.onClose();
  };

  const currentUser = data?.user as unknown as UserDocumentObject;
  const creator = post.creator as UserDocumentObject;
  const answeredBy = post.answeredBy as UserDocumentObject;
  const imperativeHandlingRef = useRef<AnswerPostModalHandler>(null);
  const {
    isOpen: showFullPostDescription,
    onOpen: setShowFullPostDescription,
  } = c.useDisclosure();

  return (
    <c.Box shadow="md" borderWidth="1px" p="6" width="100%" borderRadius="md">
      {post.answer ? (
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
                  {post.answer}
                </c.Text>
              </c.Box>
              {post.answerAttachments.length > 0 && (
                <c.Box mb="3">
                  <c.Heading as="h2" size="md" mb="2">
                    <c.Flex>
                      <MdOutlineAttachment size={25} fontWeight="light" />
                      <c.Text ml="1">Attachments</c.Text>
                    </c.Flex>
                  </c.Heading>
                  <c.Flex direction="column">
                    {post.answerAttachments.map((f: CloudFile, i: number) => (
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
                    ))}
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
            {!viewAsTutor && post.type === PostType.SPECIFIC && (
              <c.Avatar
                src={answeredBy.avatar?.url}
                name={answeredBy.fullname}
                mx={[0, 2]}
              />
            )}
            {viewAsTutor && (
              <c.Avatar
                mx={[0, 2]}
                src={creator.avatar?.url}
                name={creator.fullname}
              />
            )}
            {!viewAsTutor &&
              post.type === PostType.GLOBAL &&
              post.status === PostStatus.ANSWERED && (
                <c.Avatar
                  src={(post.answeredBy as UserDocumentObject).avatar?.url}
                  name={(post.answeredBy as UserDocumentObject).fullname}
                  mx={[0, 2]}
                />
              )}
            <c.Heading as="h3" size="md" mx="2">
              {viewAsTutor ? (
                creator.fullname
              ) : post.type === PostType.GLOBAL &&
                post.status !== PostStatus.ANSWERED ? (
                <c.Flex alignItems="center">
                  <fa.FaGlobe size="50" />
                  <c.Text mx="2">Global</c.Text>
                </c.Flex>
              ) : (
                answeredBy?.fullname
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
          {post.answer && (
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
          <time dateTime={post.createdAt!.toString()}>
            {post.createdAt!.toString()}
          </time>
        </c.Box>
        <c.Flex direction="column" mt={[4, 0]}>
          <c.Flex mb="1">
            <MdOutlineAttachment size={25} fontWeight="light" />
            <c.Text ml="2" fontWeight="bold">
              {post.attachments.length} given attachments
            </c.Text>
          </c.Flex>
          {post.status === PostStatus.ANSWERED && (
            <c.Flex mb="1">
              <MdOutlineAttachment size={25} fontWeight="light" />
              <c.Text ml="2" fontWeight="bold">
                {post.answerAttachments.length} answer attachments
              </c.Text>
            </c.Flex>
          )}
        </c.Flex>
      </c.Flex>
      {post.answer && (
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
      {post.status !== PostStatus.ANSWERED && (
        <>
          <c.Flex mt="3" direction={['column', 'row']}>
            {viewAsTutor && post.status === PostStatus.CLOSED && (
              <c.IconButton
                onClick={updatePostStatusHandler}
                aria-label="re-open post"
                variant="primary"
                icon={<fa.FaArrowUp />}
              />
            )}
            {viewAsTutor && post.status !== PostStatus.CLOSED && (
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
