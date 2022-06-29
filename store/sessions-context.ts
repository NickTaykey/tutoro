import React from 'react';
import type { SessionDocument } from '../types';

export type APIError = { errorMessage: string };
type ContextMethodReturnType = Promise<SessionDocument | APIError | any>;

interface SessionsContextObject {
  tutorId: string | null;
  sessions: SessionDocument[];
  deleteSession(sessionId: string): ContextMethodReturnType;
  approveSession(sessionId: string): ContextMethodReturnType;
}

const SessionsContext = React.createContext<SessionsContextObject>({
  tutorId: null,
  sessions: [],
  deleteSession(sessionId: string) {
    return Promise.resolve({});
  },
  approveSession(sessionId: string) {
    return Promise.resolve({});
  },
});

export default SessionsContext;
