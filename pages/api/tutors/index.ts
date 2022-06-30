import type { NextApiRequest, NextApiResponse } from 'next';
import type { HTTPError, UserDocument } from '../../../types';
import connectDB from '../../../middleware/mongo-connect';
import User from '../../../models/User';
import mongoErrorHandler from '../../../middleware/mongo-error-handler';
import Review from '../../../models/Review';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserDocument[] | HTTPError>
) {
  await connectDB();
  try {
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
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Unexpected server error!',
      error: error as string,
    });
  }
}
