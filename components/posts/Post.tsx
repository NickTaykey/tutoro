import { PostDocumentObject } from '../../models/Post';
import { PostType, PostStatus } from '../../types';
import { useContext, useState } from 'react';
import PostsContext from '../../store/posts-context';
import { useSession } from 'next-auth/react';
import { UserDocumentObject } from '../../models/User';
import { Avatar, Badge, Box, Flex, Heading, Text } from '@chakra-ui/react';

interface Props {
  post: PostDocumentObject;
  viewAsTutor: boolean;
}

const Post: React.FC<Props> = ({ post, viewAsTutor }) => {
  const ctx = useContext(PostsContext);
  const { status, data } = useSession();
  const deletePostHandler = () => {
    ctx.deletePost(
      post._id,
      post.answeredBy ? (post.answeredBy as UserDocumentObject)._id : 'global'
    );
  };
  const updatePostStatusHandler = () => {
    ctx.updatedPostStatus(
      post._id,
      post.answeredBy ? (post.answeredBy as UserDocumentObject)._id : 'global'
    );
  };
  const currentUser = data?.user as unknown as UserDocumentObject;
  const creator = post.creator as UserDocumentObject;
  const answeredBy = post.answeredBy as UserDocumentObject;
  const [showFullPostDescription, setShowFullPostDescription] =
    useState<boolean>(false);
  return (
    <Box shadow="md" borderWidth="1px" p="6" width="100%" borderRadius="md">
      <Flex direction={['column', 'row']} alignItems="center">
        {post.type === PostType.SPECIFIC ? (
          <Avatar src={answeredBy.avatar} name={answeredBy.fullname} />
        ) : (
          <Avatar />
        )}
        <Heading as="h3" size="md" ml="3" mt={[3, 3, 0, 0, 0]}>
          {status !== 'loading' && viewAsTutor
            ? creator.fullname
            : post.type === PostType.GLOBAL
            ? 'Global'
            : answeredBy?.fullname}
        </Heading>
        <Badge
          fontSize="0.8em"
          bg="purple.600"
          color="white"
          ml="3"
          mt={[3, 3, 0, 0, 0]}
        >
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
          mt={[3, 3, 0, 0, 0]}
        >
          {post.status === PostStatus.ANSWERED
            ? 'Approved!'
            : post.status === PostStatus.CLOSED
            ? 'Closed'
            : 'Not answered!'}
        </Badge>
      </Flex>
      <Text my="3">
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
      <Box>
        <strong>Date: </strong>
        <time dateTime={post.createdAt!.toString()}>
          {post.createdAt!.toString()}
        </time>
      </Box>
    </Box>
  );
};

export default Post;
