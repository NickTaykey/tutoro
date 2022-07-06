import sanitize from '../../../../../middleware/mongo-sanitize';
import connectDB from '../../../../../middleware/mongo-connect';
import mongoErrorHandler from '../../../../../middleware/mongo-error-handler';
import serverSideErrorHandler from '../../../../../middleware/server-side-error-handler';
import ensureHttpMethod from '../../../../../middleware/ensure-http-method';
import Session from '../../../../../models/Session';
import User from '../../../../../models/User';
import requireAuth from '../../../../../middleware/require-auth';
import { SessionStatus } from '../../../../../types';
import sgMail from '@sendgrid/mail';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { HTTPError } from '../../../../../types';
import type { SessionDocumentObject } from '../../../../../models/Session';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

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
            sanitizedBody.date &&
            new Date(sanitizedBody.date).getTime() > Date.now() &&
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
                tutor: tutor._id,
                user: sessionUser._id,
                status: SessionStatus.NOT_APPROVED,
              });
              tutor.requestedSessions.push(createdSession._id);
              sessionUser.bookedSessions.push(createdSession._id);
              const emailMessage = {
                to: tutor.email,
                from: 'authteam.tutorbookingapp@gmail.com',
                subject: 'You just received a tutoring session request',
                html: `<h2>There is a person who would like to have you as tutor!</h2>
                <div>
                  <strong>Subject of the session:</strong>
                  <span>${createdSession.subject}</span>
                </div>
                <strong>Topic of the session:</strong>
                <p>${createdSession.topic}</p>
                <div>To confirm or deny the session go to <a href="http://${req.headers.host}/users">Your profile</a></div>`.replace(
                  /			/g,
                  ''
                ),
              };
              await Promise.all([
                sessionUser.save(),
                tutor.save(),
                // sgMail.send(emailMessage),
              ]);
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
                : !sanitizedBody.subject
                ? 'subject'
                : 'date'
            }`,
          });
        });
      });
    });
  });
}
