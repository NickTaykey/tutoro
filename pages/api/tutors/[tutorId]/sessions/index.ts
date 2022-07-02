import sanitize from '../../../../../middleware/mongo-sanitize';
import connectDB from '../../../../../middleware/mongo-connect';
import mongoErrorHandler from '../../../../../middleware/mongo-error-handler';
import serverSideErrorHandler from '../../../../../middleware/server-side-error-handler';
import ensureHttpMethod from '../../../../../middleware/ensure-http-method';
import Session from '../../../../../models/Session';
import User from '../../../../../models/User';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { HTTPError } from '../../../../../types';
import type { SessionDocumentObject } from '../../../../../models/Session';

import requireAuth from '../../../../../middleware/require-auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionDocumentObject | HTTPError>
) {
  ensureHttpMethod(req, res, 'POST', () => {
    serverSideErrorHandler(req, res, (req, res) => {
      requireAuth(req, res, async (sessionUser, req, res) => {
        await connectDB();
        await mongoErrorHandler(req, res, 'Session', async () => {
          const tutor = await User.findOne({
            _id: req.query.tutorId,
            isTutor: true,
          });

          const sanitizedBody = sanitize(req.body);
          const createdSession = await Session.create({
            ...sanitizedBody,
            hours: Number(sanitizedBody.hours),
            date: new Date(sanitizedBody.date),
            tutorId: tutor._id,
          });
          tutor.requestedSessions.push(createdSession._id);
          sessionUser.bookedSessions.push(createdSession._id);
          await Promise.all([sessionUser.save(), tutor.save()]);
          return res.status(201).json(createdSession.toObject());
        });
      });
    });
  });
}
