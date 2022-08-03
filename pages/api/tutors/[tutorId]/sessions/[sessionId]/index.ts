import onError from '../../../../../../middleware/server-error-handler';
import requireAuth from '../../../../../../middleware/require-auth';
import sanitize from '../../../../../../utils/mongo-sanitize';
import { SessionStatus } from '../../../../../../types';
import { createRouter } from 'next-connect';
import sgMail from '@sendgrid/mail';

import type { SessionDocument } from '../../../../../../models/Session';
import type { UserDocument } from '../../../../../../models/User';
import type { ExtendedRequest } from '../../../../../../types';
import type { NextApiResponse } from 'next';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const router = createRouter<ExtendedRequest, NextApiResponse>();

router
  .use(requireAuth('You have to be authenticated to modify a Session'))
  .put(async (req, res, next) => {
    if (req.sessionUser.isTutor) {
      const session = (await req.models.Session.findById(
        req.query.sessionId
      )) as SessionDocument;
      session.status = sanitize(req.body).newStatus;
      const user = (await req.models.User.findOne({
        _id: session.user,
      })) as UserDocument;
      const promises: Promise<unknown>[] = [session.save()];
      if (session.status !== SessionStatus.NOT_APPROVED) {
        const emailMessage = {
          to: user.email,
          from: 'authteam.tutorbookingapp@gmail.com',
          subject:
            session.status === SessionStatus.APPROVED
              ? `the Tutor you chose: ${
                  req.sessionUser!.fullname
                } accepted your session request!`
              : `Unfortunately the Tutor you chose: ${
                  req.sessionUser!.fullname
                } rejected your session request!`,
          html: `${
            session.status === SessionStatus.REJECTED
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
        // promises.push(sgMail.send(emailMessage));
        if (
          session.status === SessionStatus.APPROVED &&
          req.sessionUser!.requestedSessions.length
        ) {
          await req.sessionUser!.populate('requestedSessions');
          const { requestedSessions: tutorSessions } = req.sessionUser!;
          const sessionDocuments = tutorSessions as SessionDocument[];
          req.sessionUser!.sessionEarnings = sessionDocuments.reduce(
            (acm: number, session: SessionDocument) => (acm += session.price),
            0
          );
          promises.push(req.sessionUser!.save());
        }
      }
      await Promise.all(promises);
      return res.status(200).json(session.toObject());
    }

    return res.status(403).json({
      errorMessage: 'You are not authorized to update this Session.',
    });
  });

export default router.handler({
  onError,
});
