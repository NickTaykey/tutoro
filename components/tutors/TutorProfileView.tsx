import Session from '../sessions/Session';
import Review from '../reviews/Review';
import SessionsContextProvider from '../../store/SessionsProvider';
import SessionsContext from '../../store/sessions-context';
import type { UserDocumentObject } from '../../models/User';
import type { SessionDocumentObject } from '../../models/Session';
import type { ReviewDocumentObject } from '../../models/Review';

interface Props {
  currentUser: UserDocumentObject;
}

const TutorProfileView: React.FC<Props> = (props: Props) => {
  return (
    <>
      <h2>Received Reviews</h2>
      {!!props.currentUser.reviews.length &&
        props.currentUser.reviews.map((r: ReviewDocumentObject) => (
          <Review key={r._id} tutorId={props.currentUser._id} review={r} />
        ))}
      {!props.currentUser.reviews.length && (
        <div>You have not been reviewed yet!</div>
      )}
      <h2>Requested sessions</h2>
      <SessionsContextProvider sessions={props.currentUser.requestedSessions}>
        <SessionsContext.Consumer>
          {ctx => {
            return ctx.sessions.map((s: SessionDocumentObject) => (
              <Session
                key={s._id}
                session={s}
                tutorId={s.tutorId.toString()}
                isTutor={true}
              />
            ));
          }}
        </SessionsContext.Consumer>
      </SessionsContextProvider>
    </>
  );
};

export default TutorProfileView;
