import React from 'react';
import type { SessionDocumentObject } from '../models/Session';
import { SessionStatus } from '../utils/types';

export type APIError = { errorMessage: string };
type ContextMethodReturnType = Promise<SessionDocumentObject | APIError | {}>;

interface SessionsContextObject {
  sessions: SessionDocumentObject[];
  deleteSession(sessionId: string, tutorId: string): ContextMethodReturnType;
  setSessionStatus(
    sessionId: string,
    tutorId: string,
    newStatus: SessionStatus
  ): ContextMethodReturnType;
}

const SessionsContext = React.createContext<SessionsContextObject>({
  sessions: [],
  deleteSession(sessionId: string, tutorId: string) {
    return Promise.resolve({});
  },
  setSessionStatus(
    sessionId: string,
    tutorId: string,
    newStatus: SessionStatus
  ) {
    return Promise.resolve({});
  },
});

export default SessionsContext;
