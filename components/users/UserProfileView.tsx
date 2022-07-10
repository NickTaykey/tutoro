import Session from '../sessions/Session';
import Review from '../reviews/Review';
import SessionsContextProvider from '../../store/SessionsProvider';
import SessionsContext from '../../store/sessions-context';
import PostsContext from '../../store/posts-context';
import PostsContextProvider from '../../store/PostsProvider';

import type { UserDocumentObject } from '../../models/User';
import type { ReviewDocumentObject } from '../../models/Review';
import type { SessionDocumentObject } from '../../models/Session';
import type { PostDocumentObject } from '../../models/Post';
import Link from 'next/link';
import Post from '../posts/Post';

interface Props {
  currentUser: UserDocumentObject;
}

const UserProfileView: React.FC<Props> = (props: Props) => {
  return (
    <>
      <h2>My Posts</h2>
      <PostsContextProvider posts={props.currentUser.createdPosts}>
        <PostsContext.Consumer>
          {ctx => {
            return ctx.posts.map((p: PostDocumentObject) => (
              <Post key={p._id} post={p} viewAsTutor={false} />
            ));
          }}
        </PostsContext.Consumer>
      </PostsContextProvider>
      <h2>My reviews</h2>
      {props.currentUser.createdReviews.map((r: ReviewDocumentObject) => (
        <Review key={r._id} review={r} viewAsTutor={false} />
      ))}
      <h2>My sessions</h2>
      <SessionsContextProvider sessions={props.currentUser.bookedSessions}>
        <SessionsContext.Consumer>
          {ctx => {
            return ctx.sessions.map((s: SessionDocumentObject) => (
              <Session key={s._id} session={s} viewAsTutor={false} />
            ));
          }}
        </SessionsContext.Consumer>
      </SessionsContextProvider>
      {!props.currentUser.isTutor && (
        <Link href="/users/become-tutor">Become a tutor</Link>
      )}
    </>
  );
};

export default UserProfileView;
