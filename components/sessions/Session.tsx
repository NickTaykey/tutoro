import { useContext } from 'react';
import type { SessionDocumentObject } from '../../models/Session';
import SessionsContext from '../../store/sessions-context';
import { SessionStatus } from '../../types';

interface Props {
  session: SessionDocumentObject;
  tutorId: string;
  isTutor: boolean;
}

const Session: React.FC<Props> = ({ session, tutorId, isTutor }) => {
  const ctx = useContext(SessionsContext);
  const approveSessionHandler = () => {
    ctx.setSessionStatus(session._id, tutorId, true);
  };
  const rejectSessionHandler = () => {
    ctx.setSessionStatus(session._id, tutorId, false);
  };
  const deleteSessionHandler = () => {
    ctx.deleteSession(session._id, tutorId);
  };
  const date = new Date(session.date);
  return (
    <article style={{ border: '1px solid black' }}>
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
        {session.status === SessionStatus.NOT_APPROVED && isTutor && (
          <>
            <button onClick={approveSessionHandler}>Approve session</button>
            <button onClick={rejectSessionHandler}>Reject session</button>
          </>
        )}
        {!isTutor && (
          <button onClick={deleteSessionHandler}>Delete session</button>
        )}
      </div>
    </article>
  );
};

export default Session;
