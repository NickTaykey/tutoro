import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../../middleware/mongo-connect';
import sanitize from '../../../../../middleware/mongo-sanitize';
import Review from '../../../../../models/Review';
import { Error } from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await connectDB();
  if (req.method === 'DELETE') {
    const review = await Review.findByIdAndDelete(req.query.reviewId);
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
        return res.status(400).json({ errorMessage: e.errors.stars.message });
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
