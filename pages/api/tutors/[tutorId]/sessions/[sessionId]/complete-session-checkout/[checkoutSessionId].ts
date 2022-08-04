import type { NextApiResponse } from 'next';

import onError from '../../../../../../../middleware/server-error-handler';
import requireAuth from '../../../../../../../middleware/require-auth';
import { SessionDocument } from '../../../../../../../models/Session';
import { ExtendedRequest } from '../../../../../../../utils/types';
import { createRouter } from 'next-connect';

const router = createRouter<ExtendedRequest, NextApiResponse>();

router
  .use(requireAuth('You have to be authenticated to complete the checkout'))
  .get(async (req, res) => {
    const { checkoutSessionId, sessionId } = req.query;
    if (typeof checkoutSessionId === 'string') {
      try {
        const session = (await req.models.Session.findById(
          sessionId
        )) as SessionDocument;

        session.checkoutCompleted = true;
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
