import serverSideErrorHandler from '../../../../../../middleware/server-side-error-handler';
import mongoErrorHandler from '../../../../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../../../../middleware/ensure-http-method';
import connectDB from '../../../../../../middleware/mongo-connect';
import Session from '../../../../../../models/Session';

import type { SessionDocumentObject } from '../../../../../../models/Session';
import type { HTTPError } from '../../../../../../types';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionDocumentObject | HTTPError>
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
