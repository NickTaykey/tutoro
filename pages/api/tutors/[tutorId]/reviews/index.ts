import connectDB from '../../../../../middleware/mongo-connect';
import sanitize from '../../../../../middleware/mongo-sanitize';
import Review from '../../../../../models/Review';
import { ObjectId } from 'mongoose';
import User from '../../../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import mongoErrorHandler from '../../../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../../../middleware/ensure-http-method';
import serverSideErrorHandler from '../../../../../middleware/server-side-error-handler';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ReviewAPIResponse } from '../../../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReviewAPIResponse>
) {
  serverSideErrorHandler(req, res, async (req, res) => {
    await ensureHttpMethod(req, res, 'POST', async () => {
      await connectDB();
      return mongoErrorHandler(req, res, 'user', async () => {
        const [session, tutor] = await Promise.all([
          getServerSession({ req, res }, authOptions),
          User.findOne({ _id: req.query.tutorId, isTutor: true }),
        ]);
        const user = await User.findOne({ email: session?.user?.email });

        if (!tutor) {
          return res.status(404).json({ errorMessage: 'Tutor not found' });
        }
        if (!user) {
          return res.status(403).json({
            errorMessage: 'You have to be authenticated to create a Review.',
          });
        }

        const reviewSet = new Set([
          ...tutor.reviews.map((rid: ObjectId) => rid.toString()),
          ...user.createdReviews.map((rid: ObjectId) => rid.toString()),
        ]);

        const canUserCreateReview =
          reviewSet.size === user.createdReviews.length + tutor.reviews.length;

        if (canUserCreateReview) {
          const sanitizedReqBody = sanitize(req.body);
          const review = await Review.create({
            text: sanitizedReqBody?.text,
            stars: Number(sanitizedReqBody.stars),
          });
          tutor.reviews.push(review);
          user.createdReviews.push(review);
          await user.save();
          await tutor.save();
          return res
            .status(201)
            .json({ ...review.toObject(), ownerAuthenticated: true });
        }
        return res.status(403).json({
          errorMessage: 'You have already written a review for this tutor.',
        });
      });
    });
  });
}
