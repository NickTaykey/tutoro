import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../../middleware/mongo-connect';
import sanitize from '../../../../../middleware/mongo-sanitize';
import Review from '../../../../../models/Review';
import { Error } from 'mongoose';
import User from '../../../../../models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await connectDB();
  if (req.method === 'POST') {
    try {
      const sanitizedReqBody = sanitize(req.body);
      const review = await Review.create({
        text: sanitizedReqBody?.text,
        stars: Number(sanitizedReqBody.stars),
      });
      const tutor = await User.findOne({
        _id: req.query.tutorId,
        isTutor: true,
      });
      tutor.reviews.push(review);
      await tutor.save();
      return res.status(201).json(review.toJSON());
    } catch (e) {
      if (e instanceof Error.ValidationError) {
        const { kind } = e.errors.stars;
        if (kind === 'Number' || kind === 'min' || kind === 'max')
          return res.status(400).json({
            errorMessage:
              kind === 'Number'
                ? 'star rating was passed, it has to be a number.'
                : e.errors.stars.message,
          });
      }
      return res.status(500).json({
        errorMessage: 'Unexpected internal server error',
        error: JSON.stringify(e),
      });
    }
  }
  return res.status(400).json({
    errorMessage: `This route only accepts POST requests, the current is a ${req.method}`,
  });
}
