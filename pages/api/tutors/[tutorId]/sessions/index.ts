import sanitize from '../../../../../middleware/mongo-sanitize';
import connectDB from '../../../../../middleware/mongo-connect';
import mongoErrorHandler from '../../../../../middleware/mongo-error-handler';
import serverSideErrorHandler from '../../../../../middleware/server-side-error-handler';
import ensureHttpMethod from '../../../../../middleware/ensure-http-method';
import Session from '../../../../../models/Session';
import User from '../../../../../models/User';
import requireAuth from '../../../../../middleware/require-auth';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { HTTPError } from '../../../../../types';
import type { SessionDocumentObject } from '../../../../../models/Session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionDocumentObject | HTTPError>
) {
  ensureHttpMethod(req, res, 'POST', () => {
    serverSideErrorHandler(req, res, (req, res) => {
      requireAuth(req, res, async (sessionUser, req, res) => {
        await connectDB();
        mongoErrorHandler(req, res, 'Session', async () => {
          const sanitizedBody = sanitize(req.body);
          if (
            sanitizedBody.topic &&
            Number(sanitizedBody.hours) > 0 &&
            sanitizedBody.subject
          ) {
            const tutor = await User.findOne({
              _id: req.query.tutorId,
              isTutor: true,
            });
            if (tutor.subjects.includes(sanitizedBody.subject)) {
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
            }
            return res.status(400).json({ errorMessage: 'Invalid subject' });
          }
          return res.status(400).json({
            errorMessage: `Provide a valid ${
              !sanitizedBody.topic
                ? 'topic'
                : sanitizedBody.hours < 1
                ? 'hours number'
                : 'subject'
            }`,
          });
        });
      });
    });
  });
}
