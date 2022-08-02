import sanitize from '../../../../../middleware/mongo-sanitize';
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
      requireAuth(
        req,
        res,
        'modify a Review',
        async ({ models }, sessionUser, req, res) => {
          const doesReviewExist: boolean = (
            sessionUser.createdReviews as ObjectId[]
          )
            .map((reviewId: ObjectId) => reviewId.toString())
            .includes(req.query.reviewId as string);

          if (doesReviewExist) {
            if (req.method === 'DELETE') {
              mongoErrorHandler(req, res, 'User', async () => {
                const tutor = await models.User.findOne({
                  isTutor: true,
                  _id: req.query.tutorId,
                });
                if (!tutor) {
                  return res
                    .status(404)
                    .json({ errorMessage: 'User not found' });
                }
                const review = await models.Review.findByIdAndDelete(
                  req.query.reviewId
                );
                sessionUser.createdReviews = (
                  sessionUser.createdReviews as ObjectId[]
                ).filter(
                  (reviewId: ObjectId) =>
                    reviewId.toString() !== req.query.reviewId
                );
                tutor.reviews = tutor.reviews.filter(
                  (reviewId: ObjectId) =>
                    reviewId.toString() !== req.query.reviewId
                );
                await Promise.all([sessionUser.save(), tutor.calcAvgRating()]);
                res.status(200).json(review.toJSON());
              });
            } else if (req.method === 'PUT') {
              mongoErrorHandler(req, res, 'Review', async () => {
                const review = await models.Review.findByIdAndUpdate(
                  req.query.reviewId,
                  sanitize(req.body),
                  { runValidators: true, new: true }
                );
                await Promise.all([
                  review.populate({ path: 'user', model: models.User }),
                  review.populate({ path: 'tutor', model: models.User }),
                ]);
                res.status(200).json(review.toJSON());
              });
            }
          } else res.status(404).json({ errorMessage: 'Review not found' });
        }
      );
    });
  });
}
