import { PostDocumentObject } from '../../models/Post';
import { PostType, PostStatus } from '../../types';
import { useContext } from 'react';
import Link from 'next/link';
import PostsContext from '../../store/posts-context';
import { useSession } from 'next-auth/react';
import { UserDocumentObject } from '../../models/User';

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
  const answerdBy = post.answeredBy as UserDocumentObject;
  return (
    <article>
      <h4>{post.subject}</h4>
      <h4>
        {status !== 'loading' && currentUser.isTutor
          ? creator.fullname
          : post.type === PostType.GLOBAL
          ? 'Global'
          : answerdBy?.fullname}
      </h4>
      <p>{post.description}</p>
      {status !== 'loading' && post.status === PostStatus.ANSWERED && (
        <>
          <div>Answer:</div>
          <div>{post.answer}</div>
          <div>Answered by: {answerdBy.fullname}</div>
        </>
      )}
      {status !== 'loading' && post.status === PostStatus.NOT_ANSWERED && (
        <div>Not answered</div>
      )}
      {viewAsTutor &&
        status !== 'loading' &&
        post.status !== PostStatus.CLOSED && (
          <Link
            href={`/tutors/${
              post.type === PostType.SPECIFIC
                ? (post.answeredBy as UserDocumentObject)._id
                : currentUser._id
            }/posts/${post._id}/answer`}
          >
            Answer Post
          </Link>
        )}
      {!viewAsTutor &&
        status !== 'loading' &&
        post.status === PostStatus.CLOSED && (
          <div>
            Closed by {post.type === PostType.GLOBAL ? 'a' : 'the'} Tutor.
          </div>
        )}
      <div>
        {!viewAsTutor && (
          <button onClick={deletePostHandler}>Delete post</button>
        )}
        {viewAsTutor && post.status !== PostStatus.ANSWERED && (
          <button onClick={updatePostStatusHandler}>
            {post.status !== PostStatus.CLOSED ? 'Close' : 'Reopen'} post
          </button>
        )}
      </div>
    </article>
  );
};

export default Post;

/* 
- 




*/
