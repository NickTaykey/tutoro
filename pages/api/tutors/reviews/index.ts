import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../middleware/mongo-connect';
import sanitize from '../../../../middleware/mongo-sanitize';
import Review from '../../../../models/Review';
import { Error } from 'mongoose';

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
      return res.status(201).json(review.toJSON());
    } catch (e) {
      if (e instanceof Error.ValidationError)
        return res.status(400).json({
          errorMessage:
            e.errors.stars.kind === 'Number' &&
            'star rating was passed, it has to be a number.',
        });
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
