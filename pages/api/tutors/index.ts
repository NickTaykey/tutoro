import type { NextApiRequest, NextApiResponse } from 'next';
import type { IUser } from '../../../models/User';
import type { HTTPError } from '../../../types';
import connectDB from '../../../middleware/mongo-connect';
import User from '../../../models/User';
import mongoErrorHandler from '../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../middleware/ensure-http-method';
import serverSideErrorHandler from '../../../middleware/server-side-error-handler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IUser[] | HTTPError>
) {
  ensureHttpMethod(req, res, 'GET', async () => {
    await serverSideErrorHandler(req, res, async (req, res) => {
      await connectDB();
      await mongoErrorHandler(req, res, 'User', async () => {
        const tutors = await User.find({ isTutor: true });
        res.status(200).json(tutors);
      });
    });
  });
}
