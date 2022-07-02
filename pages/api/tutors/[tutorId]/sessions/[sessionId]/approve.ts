import type { SessionDocumentObject } from '../../../../../../models/Session';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { HTTPError } from '../../../../../../types';

import connectDB from '../../../../../../middleware/mongo-connect';
import mongoErrorHandler from '../../../../../../middleware/mongo-error-handler';
import Session from '../../../../../../models/Session';
import ensureHttpMethod from '../../../../../../middleware/ensure-http-method';
import serverSideErrorHandler from '../../../../../../middleware/server-side-error-handler';
import requireAuth from '../../../../../../middleware/require-auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionDocumentObject | HTTPError>
) {
  ensureHttpMethod(req, res, 'PUT', () => {
    serverSideErrorHandler(req, res, (req, res) => {
      requireAuth(req, res, async (_, req, res) => {
        await connectDB();
        mongoErrorHandler(req, res, 'Session', async () => {
          const session = await Session.findById(req.query.sessionId);
          session.approved = true;
          await session.save();
          return res.status(200).json(session.toObject());
        });
      });
    });
  });
}
