import type { NextApiRequest, NextApiResponse } from 'next';
import type { IUser } from '../../../models/User';
import connectDB from '../../../middleware/mongo-connect';
import User from '../../../models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IUser[]>
) {
  await connectDB();
  const tutors = await User.find({ isTutor: true });
  res.status(200).json(tutors);
}
