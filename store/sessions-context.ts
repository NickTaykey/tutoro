import React from 'react';
import type { SessionDocumentObject } from '../models/Session';

export type APIError = { errorMessage: string };
type ContextMethodReturnType = Promise<SessionDocumentObject | APIError | {}>;

interface SessionsContextObject {
  sessions: SessionDocumentObject[];
  deleteSession(sessionId: string, tutorId: string): ContextMethodReturnType;
  setSessionStatus(
    sessionId: string,
    tutorId: string,
    approve: boolean
  ): ContextMethodReturnType;
}

const SessionsContext = React.createContext<SessionsContextObject>({
  sessions: [],
  deleteSession(sessionId: string, tutorId: string) {
    return Promise.resolve({});
  },
  setSessionStatus(sessionId: string, tutorId: string, approve: boolean) {
    return Promise.resolve({});
  },
});

export default SessionsContext;
