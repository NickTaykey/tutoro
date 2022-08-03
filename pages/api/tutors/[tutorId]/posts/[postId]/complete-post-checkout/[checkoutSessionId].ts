import type { NextApiResponse } from 'next';

import checkPaymentStatus from '../../../../../../../utils/check-payment-status';
import onError from '../../../../../../../middleware/server-error-handler';
import requireAuth from '../../../../../../../middleware/require-auth';
import { ExtendedRequest } from '../../../../../../../types';
import { createRouter } from 'next-connect';
import { PostDocument } from '../../../../../../../models/Post';

const router = createRouter<ExtendedRequest, NextApiResponse>();

router
  .use(requireAuth('You have to be authenticated to complete the checkout'))
  .get((req, res) => {
    const { checkoutSessionId, postId } = req.query;
    if (
      typeof checkoutSessionId === 'string' &&
      typeof checkoutSessionId === 'string'
    ) {
      checkPaymentStatus(checkoutSessionId)
        .then(async () => {
          const post = (await req.models.Post.findById(postId)) as PostDocument;
          post.checkoutCompleted = true;
          post.save();
          const queryString = new URLSearchParams({
            successAlert: 'Checkout successfully completed!',
          });
          return res.redirect('/users/user-profile?' + queryString);
        })
        .catch(() => {
          const queryString = new URLSearchParams({
            errorAlert: 'Checkout process failed, contact us.',
          });
          return res.redirect('/tutors?' + queryString);
        });
    }
  });

export default router.handler({
  onError,
});
