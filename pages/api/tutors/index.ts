import type { NextApiRequest, NextApiResponse } from 'next';
import type { HTTPError, UserDocument } from '../../../types';
import connectDB from '../../../middleware/mongo-connect';
import User from '../../../models/User';
import mongoErrorHandler from '../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../middleware/ensure-http-method';
import serverSideErrorHandler from '../../../middleware/server-side-error-handler';
import Review from '../../../models/Review';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserDocument[] | HTTPError>
) {
  ensureHttpMethod(req, res, 'GET', async () => {
    await serverSideErrorHandler(req, res, async (req, res) => {
      await connectDB();
      await mongoErrorHandler(req, res, 'User', async () => {
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
