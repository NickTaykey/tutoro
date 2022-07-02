import type { NextApiRequest, NextApiResponse } from 'next';
import type { HTTPError } from '../../../types';

import serverSideErrorHandler from '../../../middleware/server-side-error-handler';
import mongoErrorHandler from '../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../middleware/ensure-http-method';
import connectDB from '../../../middleware/mongo-connect';
import Review from '../../../models/Review';
import User from '../../../models/User';
import type { UserDocument } from '../../../models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserDocument[] | HTTPError>
) {
  ensureHttpMethod(req, res, 'GET', () => {
    serverSideErrorHandler(req, res, async (req, res) => {
      await connectDB();
      mongoErrorHandler(req, res, 'User', async () => {
        const tutors = await User.find({ isTutor: true })
          .populate({
            path: 'reviews',
            options: {
              sort: { _id: -1 },
            },
            model: Review,
          })
          .exec();
        res.status(200).json(tutors as UserDocument[]);
      });
    });
  });
}
