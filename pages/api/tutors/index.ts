import type { NextApiRequest, NextApiResponse } from 'next';
import type { IUser } from '../../../models/User';
import type { HTTPError } from '../../../types';
import connectDB from '../../../middleware/mongo-connect';
import User from '../../../models/User';
import mongoErrorHandler from '../../../middleware/mongo-error-handler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IUser[] | HTTPError>
) {
  await connectDB();
  try {
    await mongoErrorHandler(req, res, 'User', async () => {
      const tutors = await User.find({ isTutor: true });
      res.status(200).json(tutors);
    });
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Unexpected server error!',
      error: error as string,
    });
  }
}
