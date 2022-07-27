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
              return res.redirect('/users');
            })
            .catch(() => {
              res.redirect('/tutors');
            });
        }
      });
    });
  });
};

export default handler;
