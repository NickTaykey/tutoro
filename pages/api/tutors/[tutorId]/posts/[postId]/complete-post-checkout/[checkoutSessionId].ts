import type { NextApiRequest, NextApiResponse } from 'next';
import requireAuth from '../../../../../../../middleware/require-auth';
import ensureHttpMethod from '../../../../../../../middleware/ensure-http-method';
import checkPaymentStatus from '../../../../../../../utils/check-payment-status';
import mongoErrorHandler from '../../../../../../../middleware/mongo-error-handler';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  mongoErrorHandler(req, res, 'User', async () => {
    ensureHttpMethod(req, res, 'GET', (req, res) => {
      requireAuth(
        req,
        res,
        'complete checkout',
        async ({ models }, _, req, res) => {
          const { checkoutSessionId, postId } = req.query;
          if (
            typeof checkoutSessionId === 'string' &&
            typeof checkoutSessionId === 'string'
          ) {
            checkPaymentStatus(checkoutSessionId)
              .then(async () => {
                const post = await models.Post.findById(postId);
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
        }
      );
    });
  });
};

export default handler;
