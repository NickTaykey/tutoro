import serverSideErrorHandler from '../../../../../../middleware/server-side-error-handler';
import mongoErrorHandler from '../../../../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../../../../middleware/ensure-http-method';
import connectDB from '../../../../../../middleware/mongo-connect';
import Session from '../../../../../../models/Session';
import requireAuth from '../../../../../../middleware/require-auth';

import type { SessionDocumentObject } from '../../../../../../models/Session';
import type { HTTPError } from '../../../../../../types';
import type { NextApiRequest, NextApiResponse } from 'next';
import User from '../../../../../../models/User';
import { ObjectId } from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionDocumentObject | HTTPError>
) {
  ensureHttpMethod(req, res, 'DELETE', () => {
    serverSideErrorHandler(req, res, (req, res) => {
      requireAuth(req, res, async (userSession, req, res) => {
        await connectDB();
        mongoErrorHandler(req, res, 'Session', async () => {
          const [user, tutor] = await Promise.all([
            User.findById(userSession._id),
            User.findById(req.query.tutorId),
          ]);
          const sessionRegisteredOnUser = user.bookedSessions.find(
            (sessionId: ObjectId) =>
              sessionId.toString() === req.query.sessionId
          );
          const sessionRegisteredOnTutor = tutor.requestedSessions.find(
            (sessionId: ObjectId) =>
              sessionId.toString() === req.query.sessionId
          );
          if (sessionRegisteredOnUser && sessionRegisteredOnTutor) {
            const deletedSession = await Session.findByIdAndDelete(
              req.query.sessionId
            );
            user.bookedSessions = user.bookedSessions.filter(
              (sessionId: ObjectId) => {
                return sessionId.toString() !== req.query.sessionId;
              }
            );
            tutor.requestedSessions = tutor.requestedSessions.filter(
              (sessionId: ObjectId) => {
                return sessionId.toString() !== req.query.sessionId;
              }
            );
            await Promise.all([user.save(), tutor.save()]);
            return res
              .status(200)
              .json(deletedSession as SessionDocumentObject);
          }
          return res.status(403).json({
            errorMessage: 'You are not authorized to delete this Session.',
          });
        });
      });
    });
  });
}
