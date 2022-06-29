import connectDB from '../../../../../middleware/mongo-connect';
import sanitize from '../../../../../middleware/mongo-sanitize';
import Review from '../../../../../models/Review';
import User from '../../../../../models/User';
import mongoErrorHandler from '../../../../../middleware/mongo-error-handler';
import { ObjectId } from 'mongoose';
import { authOptions } from '../../../auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';

import type { ReviewAPIResponse } from '../../../../../types';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReviewAPIResponse>
) {
  await connectDB();
  const session = await getServerSession({ req, res }, authOptions);
  const user = await User.findOne({ email: session?.user?.email });

  if (!user) {
    return res
      .status(403)
      .json({ errorMessage: 'You have to be authenticated to use this ruote' });
  }

  const doesReviewExist: boolean = user.createdReviews
    .map((rid: ObjectId) => rid.toString())
    .includes(req.query.reviewId);

  if (doesReviewExist) {
    try {
      if (req.method === 'DELETE') {
        await mongoErrorHandler(req, res, 'User', async () => {
          const tutor = await User.findOne({
            isTutor: true,
            _id: req.query.tutorId,
          });
          if (!tutor) {
            return res.status(404).json({ errorMessage: 'User not found' });
          }
          const review = await Review.findByIdAndDelete(req.query.reviewId);
          user.createdReviews = user.createdReviews.filter(
            (rid: ObjectId) => rid.toString() !== req.query.reviewId
          );
          await user.save();
          res.status(200).json(review.toJSON());
        });
      } else if (req.method === 'PUT') {
        await mongoErrorHandler(req, res, 'Review', async () => {
          const review = await Review.findByIdAndUpdate(
            req.query.reviewId,
            sanitize(req.body),
            { runValidators: true, new: true }
          );
          res.status(200).json(review.toJSON());
        });
      } else {
        res.status(400).json({
          errorMessage: `This route only accepts PUT and DELETE requests, the current is a ${req.method}`,
        });
      }
    } catch (error) {
      res.status(500).json({
        errorMessage: 'Unexpected internal server error',
        error: error as string,
      });
    }
  } else res.status(404).json({ errorMessage: 'Review not found' });
}
