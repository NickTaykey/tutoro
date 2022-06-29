import React, { useReducer } from 'react';
import SessionsContext, { APIError } from './sessions-context';
import ApiHelper from '../utils/api-helper';
import type { SessionDocument } from '../types';

enum SessionActionTypes {
  APPROVE,
  DELETE,
}

interface SessionAction {
  type: SessionActionTypes;
  payload: {
    sessionId: string;
  };
}

function reducer(
  prevState: SessionDocument[],
  action: SessionAction
): SessionDocument[] {
  switch (action.type) {
    case SessionActionTypes.DELETE:
      return prevState.filter(s => s._id !== action.payload.sessionId);
    case SessionActionTypes.APPROVE:
      return prevState.map(s =>
        s._id === action.payload.sessionId ? { ...s, approved: true } : s
      );
    default:
      return prevState;
  }
}

const SessionContextProvider: React.FC<{
  sessions: SessionDocument[];
  tutorId: string;
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
        tutorId: props.tutorId,
        async approveSession(
          sessionId: string
        ): Promise<SessionDocument | APIError | any> {
          const apiResponse = await ApiHelper(
            `/api/tutors/${this.tutorId}/sessions/${sessionId}/approve`,
            null,
            'PUT'
          );
          if (!apiResponse.errorMessage) {
            dispatchSessionsAction({
              type: SessionActionTypes.APPROVE,
              payload: { sessionId },
            });
          }
          return apiResponse;
        },
        async deleteSession(
          sessionId: string
        ): Promise<SessionDocument | APIError | any> {
          const apiResponse = await ApiHelper(
            `/api/tutors/${this.tutorId}/sessions/${sessionId}`,
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
