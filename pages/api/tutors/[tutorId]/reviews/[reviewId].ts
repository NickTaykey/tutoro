import onError from '../../../../../middleware/server-error-handler';
import requireAuth from '../../../../../middleware/require-auth';
import { ReviewDocument } from '../../../../../models/Review';
import { ExtendedRequest } from '../../../../../utils/types';
import sanitize from '../../../../../utils/mongo-sanitize';
import { UserDocument } from '../../../../../models/User';
import { createRouter } from 'next-connect';

import type { NextApiResponse } from 'next';
import type { ObjectId } from 'mongoose';

interface Request extends ExtendedRequest {
  tutor: UserDocument;
  review: ReviewDocument;
}

const router = createRouter<Request, NextApiResponse>();

router
  .use(
    requireAuth('You need to be authenticated to modify a Review'),
    async (req, res, next) => {
      const results = await Promise.all([
        req.models.User.findOne({
          isTutor: true,
          _id: req.query.tutorId,
        }),
        req.models.Review.findById(req.query.reviewId),
      ]);

      req.tutor = results[0] as UserDocument;
      req.review = results[1] as ReviewDocument;

      const isReviewOwnedByTutor = (req.tutor.reviews as ObjectId[]).find(
        id => id.toString() === req.query.reviewId
      );

      const isReviewOwnedByUser = (
        req.sessionUser.createdReviews as ObjectId[]
      ).find(id => id.toString() === req.query.reviewId);

      if (
        req.tutor &&
        req.review &&
        isReviewOwnedByUser &&
        isReviewOwnedByTutor
      ) {
        return next();
      }

      return res.status(!req.tutor || !req.review ? 404 : 403).json({
        errorMessage: !req.tutor
          ? 'Tutor not found'
          : !req.review
          ? 'Review not found'
          : !isReviewOwnedByTutor
          ? 'This review does not belong to this tutor'
          : 'Your are not allowed to delete this review',
      });
    }
  )
  .delete(async (req, res) => {
    req.review.remove();
    let reviewIds = req.sessionUser.createdReviews as ObjectId[];
    req.sessionUser.createdReviews = reviewIds.filter(
      id => id.toString() !== req.query.reviewId
    );
    reviewIds = req.tutor.reviews as ObjectId[];
    req.tutor.reviews = reviewIds.filter(
      id => id.toString() !== req.query.reviewId
    );
    await Promise.all([req.sessionUser.save(), req.tutor.calcAvgRating()]);
    return res.status(200).json(req.review.toJSON());
  })
  .put(async (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    req.review.stars = sanitizedBody.stars;
    req.review.text = sanitizedBody.text;
    await Promise.all([
      req.review.save(),
      req.review.populate({ path: 'user', model: req.models.User }),
      req.review.populate({ path: 'tutor', model: req.models.User }),
    ]);
    return res.status(200).json(req.review.toJSON());
  });

export default router.handler({
  onError,
});
