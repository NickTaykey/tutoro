import Session from '../sessions/Session';
import Review from '../reviews/Review';
import SessionsContextProvider from '../../store/SessionsProvider';
import SessionsContext from '../../store/sessions-context';

import type { UserDocumentObject } from '../../models/User';
import type { ReviewDocumentObject } from '../../models/Review';
import type { SessionDocumentObject } from '../../models/Session';
import Link from 'next/link';

interface Props {
  currentUser: UserDocumentObject;
}

const UserProfileView: React.FC<Props> = (props: Props) => {
  return (
    <>
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
