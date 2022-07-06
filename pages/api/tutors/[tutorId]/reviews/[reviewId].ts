import sanitize from '../../../../../middleware/mongo-sanitize';
import connectDB from '../../../../../middleware/mongo-connect';
import Review from '../../../../../models/Review';
import User from '../../../../../models/User';
import serverSideErrorHandler from '../../../../../middleware/server-side-error-handler';
import mongoErrorHandler from '../../../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../../../middleware/ensure-http-method';
import requireAuth from '../../../../../middleware/require-auth';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ObjectId } from 'mongoose';
import type { ReviewDocumentObject } from '../../../../../models/Review';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReviewDocumentObject>
) {
  serverSideErrorHandler(req, res, (req, res) => {
    ensureHttpMethod(req, res, ['DELETE', 'PUT'], () => {
      requireAuth(req, res, async (sessionUser, req, res) => {
        await connectDB();
        const user = await User.findById(sessionUser._id);

        const doesReviewExist: boolean = user.createdReviews
          .map((reviewId: ObjectId) => reviewId.toString())
          .includes(req.query.reviewId);

        if (doesReviewExist) {
          if (req.method === 'DELETE') {
            mongoErrorHandler(req, res, 'User', async () => {
              const tutor = await User.findOne({
                isTutor: true,
                _id: req.query.tutorId,
              });
              if (!tutor) {
                return res.status(404).json({ errorMessage: 'User not found' });
              }
              const review = await Review.findByIdAndDelete(req.query.reviewId);
              user.createdReviews = user.createdReviews.filter(
                (reviewId: ObjectId) =>
                  reviewId.toString() !== req.query.reviewId
              );
              tutor.reviews = tutor.reviews.filter(
                (reviewId: ObjectId) =>
                  reviewId.toString() !== req.query.reviewId
              );
              await Promise.all([user.save(), tutor.save()]);
              res.status(200).json(review.toJSON());
            });
          } else if (req.method === 'PUT') {
            mongoErrorHandler(req, res, 'Review', async () => {
              const review = await Review.findByIdAndUpdate(
                req.query.reviewId,
                sanitize(req.body),
                { runValidators: true, new: true }
              );
              await Promise.all([
                review.populate({ path: 'user', model: User }),
                review.populate({ path: 'tutor', model: User }),
              ]);
              res.status(200).json(review.toJSON());
            });
          }
        } else res.status(404).json({ errorMessage: 'Review not found' });
      });
    });
  });
}
