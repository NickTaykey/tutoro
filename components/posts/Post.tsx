import { PostDocumentObject } from '../../models/Post';
import { PostType, PostStatus } from '../../types';
import { useContext } from 'react';
import Link from 'next/link';
import PostsContext from '../../store/posts-context';

interface Props {
  post: PostDocumentObject;
  viewAsTutor: boolean;
}

const Post: React.FC<Props> = ({ post, viewAsTutor }) => {
  const ctx = useContext(PostsContext);
  const deletePostHandler = () => {
    ctx.deletePost(post._id);
  };
  const updatePostStatusHandler = () => {
    ctx.updatedPostStatus(post._id);
  };
  return (
    <article>
      <h4>{post.subject}</h4>
      <p>{post.description}</p>
      <div>{post.createdAt?.toDateString()}</div>
      {post.status === PostStatus.NOT_ANSWERED && 'Not answered'}
      {post.status === PostStatus.CLOSED &&
        `Closed by ${post.type === PostType.GLOBAL ? 'a' : 'the'} Tutor.`}
      {post.status === PostStatus.ANSWERED && 'answered ...'}
      <div>{viewAsTutor && <Link href="#">Answer Post</Link>}</div>
      <div>
        {!viewAsTutor && (
          <button onClick={deletePostHandler}>Delete post</button>
        )}
        {viewAsTutor && (
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
