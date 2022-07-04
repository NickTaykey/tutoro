import serverSideErrorHandler from '../../../../../middleware/server-side-error-handler';
import mongoErrorHandler from '../../../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../../../middleware/ensure-http-method';
import connectDB from '../../../../../middleware/mongo-connect';
import requireAuth from '../../../../../middleware/require-auth';

import type { SessionDocumentObject } from '../../../../../models/Session';
import type { HTTPError } from '../../../../../types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { SessionStatus } from '../../../../../types';
import User from '../../../../../models/User';
import Session from '../../../../../models/Session';
import { ObjectId } from 'mongoose';
import sanitize from '../../../../../middleware/mongo-sanitize';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionDocumentObject | HTTPError>
) {
  ensureHttpMethod(req, res, ['DELETE', 'PUT'], () => {
    serverSideErrorHandler(req, res, (req, res) => {
      requireAuth(req, res, async (userSession, req, res) => {
        await connectDB();
        mongoErrorHandler(req, res, 'Session', async () => {
          let [user, tutor] = await Promise.all([
            User.findById(userSession._id),
            User.findById(req.query.tutorId),
          ]);
          if (req.method === 'DELETE') {
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
              const emailMessage = {
                to: tutor.email,
                from: 'authteam.tutorbookingapp@gmail.com',
                subject:
                  'Unfortunately a user decided to cancel a session request',
                html: `<h2>Don't worry there will be plenty other occasions!</h2>
                <div><u>Details of the session</u></div>
                <div><strong>Subject:</strong> ${deletedSession.subject}</div>
                <div><strong>Topic:</strong></div>
                <div>${deletedSession.topic}</div>
                <div>Scheduled date: ${deletedSession.date}</div>`.replace(
                  /			/g,
                  ''
                ),
              };
              await Promise.all([
                user.save(),
                tutor.save(),
                // sgMail.send(emailMessage),
              ]);
              return res
                .status(200)
                .json(deletedSession as SessionDocumentObject);
            }
            return res.status(403).json({
              errorMessage: 'You are not authorized to delete this Session.',
            });
          }
          if (req.method === 'PUT') {
            const session = await Session.findById(req.query.sessionId);
            user = await User.findOne({
              bookedSessions: { $elemMatch: { $eq: session._id } },
            });
            const sessionRegisteredOnTutor = tutor.requestedSessions.find(
              (id: ObjectId) => id.toString() === req.query.sessionId
            );
            if (sessionRegisteredOnTutor) {
              const isSessionApproved = Boolean(sanitize(req.body).approve);
              session.status = isSessionApproved
                ? SessionStatus.APPROVED
                : SessionStatus.REJECTED;
              const emailMessage = {
                to: user.email,
                from: 'authteam.tutorbookingapp@gmail.com',
                subject: isSessionApproved
                  ? `the Tutor you chose: ${tutor.fullname} accepted your session request!`
                  : `Unfortunately the Tutor you chose: ${tutor.fullname} rejected your session request!`,
                html: `${
                  !isSessionApproved
                    ? "<h2>Don't worry you can still find many tutors who are willing to help You!</h2>"
                    : ''
                }
                  <div><u>Details of the session</u></div>
                  <div><strong>Subject:<strong> ${session.subject}</div>
                  <div><strong>Topic:<strong></div>
                  <p>${session.topic}</p>
                  <div><strong>Scheduled date:<strong> ${session.date}</div>
                  <div><a href="http://${
                    req.headers.host
                  }/tutors">Visit Tutoro Home page</a> To find the best tutors for You!`.replace(
                  /			/g,
                  ''
                ),
              };
              await Promise.all([
                session.save(),
                // sgMail.send(emailMessage)
              ]);
              return res.status(200).json(session.toObject());
            }
            return res.status(403).json({
              errorMessage: 'You are not authorized to update this Session.',
            });
          }
        });
      });
    });
  });
}
