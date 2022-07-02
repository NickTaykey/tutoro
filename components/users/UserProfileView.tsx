import Session from '../sessions/Session';
import Review from '../reviews/Review';
import SessionsContextProvider from '../../store/SessionsProvider';
import SessionsContext from '../../store/sessions-context';

import type { UserDocumentObject } from '../../models/User';
import type { ReviewDocumentObject } from '../../models/Review';
import type { SessionDocumentObject } from '../../models/Session';

interface Props {
  currentUser: UserDocumentObject;
}

const UserProfileView: React.FC<Props> = (props: Props) => {
  return (
    <>
      {props.currentUser.createdReviews.map((r: ReviewDocumentObject) => (
        <Review key={r._id} review={r} tutorId={r.tutorId.toString()} />
      ))}
      <SessionsContextProvider sessions={props.currentUser.bookedSessions}>
        <SessionsContext.Consumer>
          {ctx => {
            return ctx.sessions.map((s: SessionDocumentObject) => (
              <Session
                key={s._id}
                session={s}
                tutorId={s.tutorId.toString()}
                isTutor={false}
              />
            ));
          }}
        </SessionsContext.Consumer>
      </SessionsContextProvider>
    </>
  );
};

export default UserProfileView;
