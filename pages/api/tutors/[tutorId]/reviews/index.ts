import requireAuth from '../../../../../middleware/require-auth';
import sanitize from '../../../../../utils/mongo-sanitize';

import type { ExtendedRequest } from '../../../../../utils/types';
import type { UserDocument } from '../../../../../models/User';
import type { NextApiResponse } from 'next';
import type { ObjectId } from 'mongoose';

import onError from '../../../../../middleware/server-error-handler';
import { createRouter } from 'next-connect';

const router = createRouter<ExtendedRequest, NextApiResponse>();

router
  .use(requireAuth('You have to be authenticated to create a Review'))
  .post(async (req, res) => {
    const tutor = await req.models.User.findOne({
      _id: req.query.tutorId,
      isTutor: true,
    });

    if (!tutor) {
      return res.status(404).json({ errorMessage: 'Tutor not found' });
    }

    const tutorDocument = tutor as UserDocument;

    const tutorPosts = tutorDocument.posts as ObjectId[];
    const tutorReviews = tutorDocument.reviews as ObjectId[];
    const tutorSessions = tutorDocument.requestedSessions as ObjectId[];

    const userSessions = req.sessionUser.bookedSessions as ObjectId[];
    const userCreatedPosts = req.sessionUser.createdPosts as ObjectId[];
    const userReviews = req.sessionUser.createdReviews as ObjectId[];

    const postSet = new Set([
      ...tutorPosts.map(id => id.toString()),
      ...userCreatedPosts.map(id => id.toString()),
    ]);

    const hasUserCreatedPost =
      postSet.size !== tutorPosts.length + userCreatedPosts.length;

    const sessionSet = new Set([
      ...tutorSessions.map(id => id.toString()),
      ...userSessions.map(id => id.toString()),
    ]);

    const hasUserCreatedSession =
      sessionSet.size !== tutorSessions.length + userSessions.length;

    if (tutor._id.toString() === req.sessionUser._id.toString()) {
      return res.status(403).json({
        errorMessage: 'As a Tutor you cannot review yourself!',
      });
    }
    if (!hasUserCreatedPost && !hasUserCreatedSession) {
      return res.status(403).json({
        errorMessage:
          'You must have booked a Session or created a Post to review a Tutor',
      });
    }

    const reviewSet = new Set([
      ...tutorReviews.map(id => id.toString()),
      ...userReviews.map(id => id.toString()),
    ]);

    const canUserCreateReview =
      reviewSet.size === userReviews.length + tutorReviews.length;

    if (canUserCreateReview) {
      const sanitizedReqBody = sanitize(req.body);
      const review = await req.models.Review.create({
        text: sanitizedReqBody?.text,
        stars: Number(sanitizedReqBody.stars),
        tutor: tutorDocument._id,
        user: req.sessionUser._id,
      });

      tutorDocument.reviews.push(review);
      req.sessionUser.createdReviews.push(review);

      await Promise.all([
        tutorDocument.calcAvgRating(),
        req.sessionUser.save(),
      ]);

      return res.status(201).json({
        ...review.toObject(),
        user: req.sessionUser,
        tutor: tutorDocument,
        ownerAuthenticated: true,
      });
    }

    return res.status(403).json({
      errorMessage: 'You have already written a review for this tutor.',
    });
  });

export default router.handler({
  onError,
});
