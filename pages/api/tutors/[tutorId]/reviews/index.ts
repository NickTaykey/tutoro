import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../../middleware/mongo-connect';
import sanitize from '../../../../../middleware/mongo-sanitize';
import Review from '../../../../../models/Review';
import { Error, ObjectId } from 'mongoose';
import User from '../../../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import type { ReviewAPIResponse } from '../../../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReviewAPIResponse>
) {
  if (req.method === 'POST') {
    await connectDB();
    const [session, tutor] = await Promise.all([
      getServerSession({ req, res }, authOptions),
      User.findById(req.query.tutorId),
    ]);
    const user = await User.findOne({ email: session?.user?.email });
    try {
      if (user && tutor) {
        const reviewSet = new Set([
          ...tutor.reviews.map((rid: ObjectId) => rid.toString()),
          ...user.createdReviews.map((rid: ObjectId) => rid.toString()),
        ]);
        const canUserCreateReview =
          reviewSet.size === user.createdReviews.length + tutor.reviews.length;
        console.log(
          reviewSet.size,
          user.createdReviews.length + tutor.reviews.length
        );
        if (canUserCreateReview) {
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
            user.createdReviews.push(review);
            await user.save();
            await tutor.save();
            return res
              .status(201)
              .json({ ...review.toObject(), ownerAuthenticated: true });
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
        return res.status(403).json({
          errorMessage: 'You have already written a review for this tutor.',
        });
      }
      return res.status(403).json({
        errorMessage: !user
          ? 'You have to be authenticated to use this ruote'
          : 'No tutors found with the provided id',
      });
    } catch (e) {
      if (e instanceof Error.CastError)
        return res
          .status(400)
          .json({ errorMessage: 'Invalid user id provided!' });
      return res.status(500).json({ errorMessage: 'Unexpected server error!' });
    }
  }
  return res.status(400).json({
    errorMessage: `This route only accepts POST requests, the current is a ${req.method}`,
  });
}
