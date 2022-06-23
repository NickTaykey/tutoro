import type { NextApiRequest, NextApiResponse } from 'next';
import type { TutorObjectGeoJSON } from '../../../types';
import connectDB from '../../../middleware/mongo-connect';
import User from '../../../models/User';
import Review from '../../../models/Review';
import { Error } from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TutorObjectGeoJSON | {}>
) {
  await connectDB();
  try {
    const tutor = await User.findById(req.query.tutorId)
      .populate({
        path: 'reviews',
        options: {
          sort: { _id: -1 },
        },
        model: Review,
      })
      .exec();
    return res.status(200).json(tutor ? tutor : {});
  } catch (e) {
    if (e instanceof Error.CastError)
      return res
        .status(400)
        .json({ errorMessage: 'Invalid user id provided!' });
    return res.status(500).json({ errorMessage: 'Unexpected server error!' });
  }
}
