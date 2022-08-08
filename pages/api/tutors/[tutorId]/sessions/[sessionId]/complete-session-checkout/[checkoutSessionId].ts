import type { NextApiResponse } from 'next';

import onError from '../../../../../../../middleware/server-error-handler';
import requireAuth from '../../../../../../../middleware/require-auth';
import { SessionDocument } from '../../../../../../../models/Session';
import { ExtendedRequest } from '../../../../../../../utils/types';
import { createRouter } from 'next-connect';
import Ably from 'ably/promises';

const router = createRouter<ExtendedRequest, NextApiResponse>();

router
  .use(requireAuth('You have to be authenticated to complete the checkout'))
  .get(async (req, res) => {
    const client = new Ably.Realtime(process.env.ABLY_API_KEY!);
    const { checkoutSessionId, sessionId } = req.query;
    if (typeof checkoutSessionId === 'string') {
      try {
        const session = (await req.models.Session.findById(
          sessionId
        )) as SessionDocument;
        session.checkoutCompleted = true;

        client.channels
          .get(session.tutor.toString())
          .publish('new-session', session.toJSON());

        session.save();
        const queryString = new URLSearchParams({
          successAlert: 'Checkout successfully completed!',
        });
        return res.redirect('/users/user-profile?' + queryString);
      } catch (err) {
        const queryString = new URLSearchParams({
          errorAlert: 'Checkout process failed, contact us.',
        });
        return res.redirect('/tutors?' + queryString);
      }
    }
  });

export default router.handler({
  onError,
});
