import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

import { ExtendedRequest, SessionStatus } from '../../../../../types';
import type { NextApiResponse } from 'next';
import type { SessionDocument } from '../../../../../models/Session';

import onError from '../../../../../middleware/server-error-handler';
import requireAuth from '../../../../../middleware/require-auth';
import { createRouter } from 'next-connect';
import sanitize from '../../../../../utils/mongo-sanitize';
import createCheckoutSession from '../../../../../utils/create-checkout-session';
import { getSessionDocumentObject } from '../../../../../utils/casting-helpers';
import { UserDocument } from '../../../../../models/User';

const router = createRouter<ExtendedRequest, NextApiResponse>();

router.post(
  requireAuth('You have to be authenticated to book a tutoring Session'),
  async (req, res) => {
    const sanitizedBody = sanitize(req.body);
    if (
      sanitizedBody.topic &&
      Number(sanitizedBody.hours) > 0 &&
      sanitizedBody.date &&
      new Date(sanitizedBody.date).getTime() > Date.now() &&
      sanitizedBody.subject
    ) {
      const tutor = (await req.models.User.findOne({
        _id: req.query.tutorId,
        isTutor: true,
      })) as UserDocument;

      if (!tutor) {
        return res.status(404).json({ errorMessage: 'Tutor not found' });
      }

      if (tutor.subjects.includes(sanitizedBody.subject)) {
        const createdSession = await req.models.Session.create({
          ...sanitizedBody,
          hours: Number(sanitizedBody.hours),
          date: new Date(sanitizedBody.date),
          tutor: tutor,
          user: req.sessionUser,
          price: tutor.sessionPricePerHour * +sanitizedBody.hours,
          status: SessionStatus.NOT_APPROVED,
        });
        tutor.requestedSessions.push(createdSession._id);
        req.sessionUser.bookedSessions.push(createdSession._id);
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
          req.sessionUser.save(),
          tutor.save(),
          // sgMail.send(emailMessage),
        ]);
        return createCheckoutSession(
          getSessionDocumentObject(createdSession as SessionDocument),
          req,
          res
        );
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
  }
);

export default router.handler({ onError });
