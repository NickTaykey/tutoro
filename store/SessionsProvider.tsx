import React, { useReducer } from 'react';
import SessionsContext, { APIError } from './sessions-context';
import ApiHelper from '../utils/api-helper';
import type { SessionDocumentObject } from '../models/Session';
import { SessionStatus } from '../utils/types';

enum SessionActionTypes {
  UPDATE,
  DELETE,
}

interface SessionAction {
  type: SessionActionTypes;
  payload: {
    sessionId: string;
    sessionStatus?: SessionStatus;
  };
}

function reducer(
  prevState: SessionDocumentObject[],
  action: SessionAction
): SessionDocumentObject[] {
  switch (action.type) {
    case SessionActionTypes.DELETE:
      return prevState.filter(s => s._id !== action.payload.sessionId);
    case SessionActionTypes.UPDATE:
      return prevState.map(s =>
        s._id === action.payload.sessionId
          ? { ...s, status: action.payload.sessionStatus! }
          : s
      );
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
        async deleteSession(
          sessionId: string,
          tutorId: string
        ): Promise<SessionDocumentObject | APIError> {
          const apiResponse = await ApiHelper(
            `/api/tutors/${tutorId}/sessions/${sessionId}`,
            null,
            'DELETE'
          );
          if (!apiResponse.errorMessage) {
            dispatchSessionsAction({
              type: SessionActionTypes.DELETE,
              payload: { sessionId },
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
