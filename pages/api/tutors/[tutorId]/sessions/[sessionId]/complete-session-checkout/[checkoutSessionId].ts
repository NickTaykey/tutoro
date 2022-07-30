import type { NextApiRequest, NextApiResponse } from 'next';
import requireAuth from '../../../../../../../middleware/require-auth';
import ensureHttpMethod from '../../../../../../../middleware/ensure-http-method';
import checkPaymentStatus from '../../../../../../../utils/check-payment-status';
import Session from '../../../../../../../models/Session';
import mongoErrorHandler from '../../../../../../../middleware/mongo-error-handler';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  mongoErrorHandler(req, res, 'User', async () => {
    ensureHttpMethod(req, res, 'GET', (req, res) => {
      requireAuth(req, res, 'complete checkout', async (_, req, res) => {
        const { checkoutSessionId, sessionId } = req.query;
        if (
          typeof checkoutSessionId === 'string' &&
          typeof checkoutSessionId === 'string'
        ) {
          checkPaymentStatus(checkoutSessionId)
            .then(async () => {
              const session = await Session.findById(sessionId);
              session.checkoutCompleted = true;
              session.save();
              const queryString = new URLSearchParams({
                successAlert: 'Checkout successfully completed!',
              });
              return res.redirect('/users?' + queryString);
            })
            .catch(() => {
              const queryString = new URLSearchParams({
                errorAlert: 'Checkout process failed, contact us.',
              });
              res.redirect('/tutors?' + queryString);
            });
        }
      });
    });
  });
};

export default handler;
