import type { NextApiRequest, NextApiResponse } from 'next';
import type { ISession, HTTPError } from '../../../../../../types';
import connectDB from '../../../../../../middleware/mongo-connect';
import mongoErrorHandler from '../../../../../../middleware/mongo-error-handler';
import Session from '../../../../../../models/Session';
import ensureHttpMethod from '../../../../../../middleware/ensure-http-method';
import serverSideErrorHandler from '../../../../../../middleware/server-side-error-handler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ISession | HTTPError>
) {
  ensureHttpMethod(req, res, 'POST', async () => {
    await serverSideErrorHandler(req, res, async (req, res) => {
      await connectDB();
      await mongoErrorHandler(req, res, 'Session', async () => {
        const session = await Session.findById(req.query.sessionId);
        session.approved = true;
        await session.save();
        return res.status(200).json(session.toObject());
      });
    });
  });
}
