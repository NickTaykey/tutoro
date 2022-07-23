import type { NextApiRequest, NextApiResponse } from 'next';
import type { TutorObjectGeoJSON, HTTPError } from '../../../../types';

import serverSideErrorHandler from '../../../../middleware/server-side-error-handler';
import mongoErrorHandler from '../../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../../middleware/ensure-http-method';
import connectDB from '../../../../middleware/mongo-connect';
import requireAuth from '../../../../middleware/require-auth';
import sanitize from '../../../../middleware/mongo-sanitize';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TutorObjectGeoJSON | HTTPError>
) {
  ensureHttpMethod(req, res, 'PUT', () => {
    serverSideErrorHandler(req, res, (req, res) => {
      requireAuth(req, res, 'update a User', async (sessionUser, req, res) => {
        await connectDB();
        mongoErrorHandler(req, res, 'User', async () => {
          const { globalPostsEnabled } = sanitize(req.body);
          sessionUser.globalPostsEnabled = eval(globalPostsEnabled);
          sessionUser.save();
          return res.status(200);
        });
      });
    });
  });
}
