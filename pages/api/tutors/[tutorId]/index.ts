import type { NextApiRequest, NextApiResponse } from 'next';
import type { TutorObjectGeoJSON, HTTPError } from '../../../../types';
import connectDB from '../../../../middleware/mongo-connect';
import User from '../../../../models/User';
import Review from '../../../../models/Review';
import mongoErrorHandler from '../../../../middleware/mongo-error-handler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TutorObjectGeoJSON | HTTPError>
) {
  await connectDB();
  try {
    await mongoErrorHandler(req, res, 'User', async () => {
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
    });
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Unexpected server error!',
      error: error as string,
    });
  }
}
