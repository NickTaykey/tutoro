import React from 'react';
import type { SessionDocumentObject } from '../models/Session';

export type APIError = { errorMessage: string };
type ContextMethodReturnType = Promise<SessionDocumentObject | APIError | {}>;

interface SessionsContextObject {
  sessions: SessionDocumentObject[];
  deleteSession(sessionId: string, tutorId: string): ContextMethodReturnType;
  approveSession(sessionId: string, tutorId: string): ContextMethodReturnType;
}

const SessionsContext = React.createContext<SessionsContextObject>({
  sessions: [],
  deleteSession(sessionId: string, tutorId: string) {
    return Promise.resolve({});
  },
  approveSession(sessionId: string, tutorId: string) {
    return Promise.resolve({});
  },
});

export default SessionsContext;
