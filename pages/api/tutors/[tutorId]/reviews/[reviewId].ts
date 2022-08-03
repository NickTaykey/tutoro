import onError from '../../../../../middleware/server-error-handler';
import requireAuth from '../../../../../middleware/require-auth';
import sanitize from '../../../../../utils/mongo-sanitize';
import { ExtendedRequest } from '../../../../../types';
import { createRouter } from 'next-connect';

import type { NextApiResponse } from 'next';
import type { ObjectId } from 'mongoose';
import { UserDocument } from '../../../../../models/User';
import { ReviewDocument } from '../../../../../models/Review';

const router = createRouter<ExtendedRequest, NextApiResponse>();

router
  .use(
    requireAuth('You need to be authenticated to modify a Review'),
    async (req, res, next) => {
      const userReviewIds = req.sessionUser.createdReviews as ObjectId[];
      const doesReviewExist: boolean = userReviewIds
        .map((reviewId: ObjectId) => reviewId.toString())
        .includes(req.query.reviewId as string);
      if (doesReviewExist) {
        return next();
      }
      return res.status(404).json({ errorMessage: 'Review not found' });
    }
  )
  .delete(async (req, res) => {
    const tutor = (await req.models.User.findOne({
      isTutor: true,
      _id: req.query.tutorId,
    })) as UserDocument;
    if (!tutor) {
      return res.status(404).json({ errorMessage: 'Tutor not found' });
    }
    const review = await req.models.Review.findByIdAndDelete(
      req.query.reviewId
    );
    if (review) {
      const userReviewIds = req.sessionUser.createdReviews as ObjectId[];
      const tutorReviewIds = req.sessionUser.createdReviews as ObjectId[];
      req.sessionUser.createdReviews = userReviewIds.filter(
        id => id.toString() !== req.query.reviewId
      );
      tutor.reviews = tutorReviewIds.filter(
        id => id.toString() !== req.query.reviewId
      );
      await Promise.all([req.sessionUser.save(), tutor.calcAvgRating()]);
      return res.status(200).json(review.toJSON());
    }
    return res.status(404).json({ errorMessage: 'Review not found' });
  })
  .put(async (req, res, next) => {
    const review = (await req.models.Review.findByIdAndUpdate(
      req.query.reviewId,
      sanitize(req.body),
      { runValidators: true, new: true }
    )) as ReviewDocument;
    if (review) {
      await Promise.all([
        review.populate({ path: 'user', model: req.models.User }),
        review.populate({ path: 'tutor', model: req.models.User }),
      ]);
      res.status(200).json(review.toJSON());
    }
    return res.status(404).json({ errorMessage: 'Review not found' });
  });

export default router.handler({
  onError,
});
