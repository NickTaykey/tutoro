import { useContext } from 'react';
import type { SessionDocumentObject } from '../../models/Session';
import type { UserDocumentObject } from '../../models/User';
import SessionsContext from '../../store/sessions-context';
import { SessionStatus } from '../../types';

interface Props {
  session: SessionDocumentObject;
  viewAsTutor: boolean;
}

const Session: React.FC<Props> = ({ session, viewAsTutor }) => {
  const ctx = useContext(SessionsContext);
  const { tutor, user } = session;
  const { _id: tutorId } = tutor as UserDocumentObject;

  const approveSessionHandler = () => {
    ctx.setSessionStatus(session._id, tutorId.toString(), true);
  };

  const rejectSessionHandler = () => {
    ctx.setSessionStatus(session._id, tutorId.toString(), false);
  };

  const deleteSessionHandler = () => {
    ctx.deleteSession(session._id, tutorId.toString());
  };

  const date = new Date(session.date);

  return (
    <article style={{ border: '1px solid black' }}>
      <h3>
        {viewAsTutor
          ? (user as UserDocumentObject).fullname
          : (tutor as UserDocumentObject).fullname}
      </h3>
      <div>Subject: {session.topic}</div>
      <div>
        <strong>{session.hours} hours</strong>
      </div>
      <p>{session.topic}</p>
      <time dateTime={date.toDateString()}>{date.toDateString()}</time>
      <div>
        <strong>
          {session.status === SessionStatus.APPROVED
            ? 'Approved!'
            : session.status === SessionStatus.REJECTED
            ? 'Rejected'
            : 'Not approved yet!'}
        </strong>
        <br />
        {session.status === SessionStatus.NOT_APPROVED && viewAsTutor && (
          <>
            <button onClick={approveSessionHandler}>Approve session</button>
            <button onClick={rejectSessionHandler}>Reject session</button>
          </>
        )}
        {!viewAsTutor && (
          <button onClick={deleteSessionHandler}>Delete session</button>
        )}
      </div>
    </article>
  );
};

export default Session;
