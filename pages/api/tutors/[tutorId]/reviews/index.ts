import connectDB from '../../../../../middleware/mongo-connect';
import sanitize from '../../../../../middleware/mongo-sanitize';
import Review, { ReviewDocumentObject } from '../../../../../models/Review';
import User from '../../../../../models/User';
import mongoErrorHandler from '../../../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../../../middleware/ensure-http-method';
import serverSideErrorHandler from '../../../../../middleware/server-side-error-handler';
import requireAuth from '../../../../../middleware/require-auth';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ObjectId } from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReviewDocumentObject>
) {
  serverSideErrorHandler(req, res, (req, res) => {
    ensureHttpMethod(req, res, 'POST', () => {
      requireAuth(req, res, async (userSession, req, res) => {
        await connectDB();
        return mongoErrorHandler(req, res, 'user', async () => {
          const [tutor, user] = await Promise.all([
            User.findOne({
              _id: req.query.tutorId,
              isTutor: true,
            }),
            User.findById(userSession._id),
          ]);

          if (!tutor) {
            return res.status(404).json({ errorMessage: 'Tutor not found' });
          }
          if (tutor._id.toString() === user._id.toString()) {
            return res
              .status(403)
              .json({ errorMessage: 'As a Tutor you cannot review yourself!' });
          }

          const reviewSet = new Set([
            ...tutor.reviews.map((rid: ObjectId) => rid.toString()),
            ...user.createdReviews.map((rid: ObjectId) => rid.toString()),
          ]);

          const canUserCreateReview =
            reviewSet.size ===
            user.createdReviews.length + tutor.reviews.length;

          if (canUserCreateReview) {
            const sanitizedReqBody = sanitize(req.body);
            const review = await Review.create({
              text: sanitizedReqBody?.text,
              stars: Number(sanitizedReqBody.stars),
              tutorId: tutor._id,
            });
            tutor.reviews.push(review);
            user.createdReviews.push(review);
            await Promise.all([user.save(), tutor.save()]);
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
  });
}
