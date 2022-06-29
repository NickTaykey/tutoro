import { useContext } from 'react';
import SessionsContext from '../../store/sessions-context';
import { SessionDocument } from '../../types';

interface Props {
  session: SessionDocument;
}

const Session: React.FC<Props> = ({ session }) => {
  const ctx = useContext(SessionsContext);
  const approveSessionHandler = () => ctx.approveSession(session._id);
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
        <strong>{session.approved ? 'Approved!' : 'Not approved yet!'}</strong>
        <br />
        {!session.approved && (
          <button onClick={approveSessionHandler}>Approve session</button>
        )}
      </div>
    </article>
  );
};

export default Session;
