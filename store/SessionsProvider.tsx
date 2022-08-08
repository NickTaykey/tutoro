import React, { useReducer } from 'react';
import SessionsContext, { APIError } from './sessions-context';
import ApiHelper from '../utils/api-helper';
import type { SessionDocumentObject } from '../models/Session';
import { SessionStatus } from '../utils/types';

enum SessionActionTypes {
  UPDATE,
  ADD,
}

type AddSessionAction = {
  type: SessionActionTypes.ADD;
  payload: SessionDocumentObject;
};

type UpdateSessionStatus = {
  type: SessionActionTypes.UPDATE;
  payload: { sessionId: string; sessionStatus: SessionStatus };
};

type SessionAction = AddSessionAction | UpdateSessionStatus;

function reducer(
  prevState: SessionDocumentObject[],
  action: SessionAction
): SessionDocumentObject[] {
  switch (action.type) {
    case SessionActionTypes.UPDATE:
      return prevState.map(s =>
        s._id === action.payload.sessionId
          ? { ...s, status: action.payload.sessionStatus! }
          : s
      );
    case SessionActionTypes.ADD:
      debugger;
      return [action.payload, ...prevState];
    default:
      return prevState;
  }
}

const SessionContextProvider: React.FC<{
  sessions: SessionDocumentObject[];
  children: React.ReactNode[] | React.ReactNode;
}> = props => {
  const [sessions, dispatchSessionsAction] = useReducer(
    reducer,
    props.sessions
  );
  return (
    <SessionsContext.Provider
      value={{
        sessions,
        addSession(session: SessionDocumentObject) {
          dispatchSessionsAction({
            type: SessionActionTypes.ADD,
            payload: session,
          });
        },
        async setSessionStatus(
          sessionId: string,
          tutorId: string,
          newStatus: SessionStatus
        ): Promise<SessionDocumentObject | APIError> {
          const apiResponse = await ApiHelper(
            `/api/tutors/${tutorId}/sessions/${sessionId}`,
            { newStatus },
            'PUT'
          );
          if (!apiResponse.errorMessage) {
            dispatchSessionsAction({
              type: SessionActionTypes.UPDATE,
              payload: {
                sessionId,
                sessionStatus: newStatus,
              },
            });
          }
          return apiResponse;
        },
      }}
    >
      {props.children}
    </SessionsContext.Provider>
  );
};

export default SessionContextProvider;
