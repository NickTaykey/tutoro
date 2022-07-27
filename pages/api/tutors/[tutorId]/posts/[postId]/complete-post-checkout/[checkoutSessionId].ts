import type { NextApiRequest, NextApiResponse } from 'next';
import requireAuth from '../../../../../../../middleware/require-auth';
import ensureHttpMethod from '../../../../../../../middleware/ensure-http-method';
import checkPaymentStatus from '../../../../../../../utils/check-payment-status';
import Post from '../../../../../../../models/Post';
import mongoErrorHandler from '../../../../../../../middleware/mongo-error-handler';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  mongoErrorHandler(req, res, 'User', async () => {
    ensureHttpMethod(req, res, 'GET', (req, res) => {
      requireAuth(req, res, 'complete checkout', async (_, req, res) => {
        const { checkoutSessionId, postId } = req.query;
        if (
          typeof checkoutSessionId === 'string' &&
          typeof checkoutSessionId === 'string'
        ) {
          checkPaymentStatus(checkoutSessionId)
            .then(async () => {
              const post = await Post.findById(postId);
              post.checkoutCompleted = true;
              post.save();
              const queryString = new URLSearchParams({
                successAlert:
                  "Checkout successfully completed! Your Post has been created, you'll receive an answer in a while, thank you!",
              });
              return res.redirect('/users?' + queryString);
            })
            .catch(() => {
              const queryString = new URLSearchParams({
                errorAlert:
                  'The checkout process failed unexpectedly, your Post has not been created, If you completed the checkout, please contact us.',
              });
              res.redirect('/tutors?' + queryString);
            });
        }
      });
    });
  });
};

export default handler;
