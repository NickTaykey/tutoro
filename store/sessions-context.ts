import React from 'react';
import type { SessionDocumentObject } from '../models/Session';
import { SessionStatus } from '../utils/types';

export type APIError = { errorMessage: string };

interface SessionsContextObject {
  sessions: SessionDocumentObject[];
  addSession(session: SessionDocumentObject): void;
  setSessionStatus(
    sessionId: string,
    tutorId: string,
    newStatus: SessionStatus
  ): void;
}

const SessionsContext = React.createContext<SessionsContextObject>({
  sessions: [],
  addSession(session: SessionDocumentObject) {},
  setSessionStatus(
    sessionId: string,
    tutorId: string,
    newStatus: SessionStatus
  ) {
    return Promise.resolve({});
  },
});

export default SessionsContext;
