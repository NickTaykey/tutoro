import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../../middleware/mongo-connect';
import sanitize from '../../../../../middleware/mongo-sanitize';
import Review from '../../../../../models/Review';
import { Error, ObjectId } from 'mongoose';
import { authOptions } from '../../../auth/[...nextauth]';
import User from '../../../../../models/User';
import { getServerSession } from 'next-auth/next';
import type { ReviewAPIResponse } from '../../../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReviewAPIResponse>
) {
  await connectDB();
  const session = await getServerSession({ req, res }, authOptions);
  const user = await User.findOne({ email: session?.user?.email });
  if (user) {
    for (const r of user.createdReviews) {
      if (r.toString() === req.query.reviewId) {
        if (req.method === 'DELETE') {
          const review = await Review.findByIdAndDelete(req.query.reviewId);
          user.createdReviews = user.createdReviews.filter(
            (rid: ObjectId) => rid.toString() !== req.query.reviewId
          );
          console.log(user.createdReviews.length);
          await user.save();
          if (review) return res.status(200).json(review.toJSON());
          return res.status(404).json({ errorMessage: 'Review not found' });
        }
        if (req.method === 'PUT') {
          try {
            const review = await Review.findByIdAndUpdate(
              req.query.reviewId,
              sanitize(req.body),
              { runValidators: true, new: true }
            );
            if (review) return res.status(200).json(review.toJSON());
            return res.status(404).json({ errorMessage: 'Review not found' });
          } catch (e) {
            if (e instanceof Error.CastError)
              return res.status(400).json({
                errorMessage: `An invalid ${
                  e.kind === 'Number'
                    ? 'star rating was passed, it has to be a number.'
                    : 'review id was passed.'
                }`,
              });
            if (e instanceof Error.ValidationError)
              return res
                .status(400)
                .json({ errorMessage: e.errors.stars.message });
            return res.status(500).json({
              errorMessage: 'Unexpected internal server error',
              error: JSON.stringify(e),
            });
          }
        }
        return res.status(400).json({
          errorMessage: `This route only accepts PUT and DELETE requests, the current is a ${req.method}`,
        });
      }
    }
  }
  return res
    .status(403)
    .json({ errorMessage: 'You have to be authenticated to use this ruote' });
}
