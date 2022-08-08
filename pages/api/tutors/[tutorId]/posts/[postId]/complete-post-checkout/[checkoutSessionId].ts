import type { NextApiResponse } from 'next';

import checkPaymentStatus from '../../../../../../../utils/check-payment-status';
import onError from '../../../../../../../middleware/server-error-handler';
import requireAuth from '../../../../../../../middleware/require-auth';
import { ExtendedRequest } from '../../../../../../../utils/types';
import { PostDocument } from '../../../../../../../models/Post';
import { createRouter } from 'next-connect';
import Ably from 'ably/promises';

const router = createRouter<ExtendedRequest, NextApiResponse>();

router
  .use(requireAuth('You have to be authenticated to complete the checkout'))
  .get(async (req, res) => {
    const client = new Ably.Realtime(process.env.ABLY_API_KEY!);
    try {
      const { checkoutSessionId, postId } = req.query;
      if (typeof checkoutSessionId === 'string') {
        const resolvedPromises = await Promise.all([
          req.models.Post.findById(postId),
          checkPaymentStatus(checkoutSessionId),
        ]);

        const postDocument = resolvedPromises[0] as PostDocument;
        postDocument.checkoutCompleted = true;

        client.channels
          .get(postDocument.answeredBy?.toString()!)
          .publish('new-post', postDocument.toJSON());

        postDocument.save();

        const queryString = new URLSearchParams({
          successAlert: 'Checkout successfully completed!',
        });
        return res.redirect('/users/user-profile?' + queryString);
      }
    } catch (err) {
      const queryString = new URLSearchParams({
        errorAlert: 'Checkout process failed, contact us.',
      });
      return res.redirect('/tutors?' + queryString);
    }
  });

export default router.handler({
  onError,
});
