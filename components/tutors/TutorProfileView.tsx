import Session from '../sessions/Session';
import Review from '../reviews/Review';
import Post from '../posts/Post';
import SessionsContextProvider from '../../store/SessionsProvider';
import SessionsContext from '../../store/sessions-context';
import type { UserDocumentObject } from '../../models/User';
import type { SessionDocumentObject } from '../../models/Session';
import type { ReviewDocumentObject } from '../../models/Review';
import type { PostDocumentObject } from '../../models/Post';
import { SessionStatus } from '../../types';
import PostsContextProvider from '../../store/PostsProvider';
import PostsContext from '../../store/posts-context';

interface Props {
  pertinentGlobalPosts: PostDocumentObject[];
  currentUser: UserDocumentObject;
}

const TutorProfileView: React.FC<Props> = (props: Props) => {
  return (
    <>
      <h2>Received Reviews</h2>
      {!!props.currentUser.reviews.length && (
        <>
          <div>Your average rating is {props.currentUser.avgRating}</div>
          {props.currentUser.reviews.map((r: ReviewDocumentObject) => (
            <Review key={r._id} review={r} deleteUserCreateReviewId={null} />
          ))}
        </>
      )}
      {!props.currentUser.reviews.length && (
        <div>You have not been reviewed yet!</div>
      )}
      <h2>Posts</h2>
      <PostsContextProvider posts={props.currentUser.posts}>
        <PostsContext.Consumer>
          {ctx => {
            return ctx.posts.map((p: PostDocumentObject) => (
              <Post key={p._id} post={p} viewAsTutor={true} />
            ));
          }}
        </PostsContext.Consumer>
      </PostsContextProvider>
      <h2>Requested sessions</h2>
      <SessionsContextProvider
        sessions={props.currentUser.requestedSessions.filter(
          s => s.status !== SessionStatus.REJECTED
        )}
      >
        <SessionsContext.Consumer>
          {ctx => {
            return ctx.sessions.map((s: SessionDocumentObject) => (
              <Session key={s._id} session={s} viewAsTutor />
            ));
          }}
        </SessionsContext.Consumer>
      </SessionsContextProvider>
      <h2>Tutor global posts</h2>
      <PostsContextProvider posts={props.pertinentGlobalPosts}>
        <PostsContext.Consumer>
          {ctx => {
            return ctx.posts.map((p: PostDocumentObject) => (
              <Post key={p._id} post={p} viewAsTutor={true} />
            ));
          }}
        </PostsContext.Consumer>
      </PostsContextProvider>
    </>
  );
};

export default TutorProfileView;
