import connectDB from '../../../../../middleware/mongo-connect';
import sanitize from '../../../../../middleware/mongo-sanitize';
import mongoErrorHandler from '../../../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../../../middleware/ensure-http-method';
import serverSideErrorHandler from '../../../../../middleware/server-side-error-handler';
import requireAuth from '../../../../../middleware/require-auth';

import type { UserDocument } from '../../../../../models/User';
import type { ReviewDocumentObject } from '../../../../../models/Review';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { ObjectId } from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReviewDocumentObject>
) {
  serverSideErrorHandler(req, res, (req, res) => {
    ensureHttpMethod(req, res, 'POST', () => {
      requireAuth(
        req,
        res,
        'create a Review',
        async ({ models }, userSession, req, res) => {
          await connectDB;
          return mongoErrorHandler(req, res, 'user', async () => {
            const tutor = await models.User.findOne({
              _id: req.query.tutorId,
              isTutor: true,
            });
            if (!tutor) {
              return res.status(404).json({ errorMessage: 'Tutor not found' });
            }
            const tutorDocument = tutor as UserDocument;
            const hasUserCreatedPost =
              new Set(
                ...tutorDocument.posts.map(id => (id as ObjectId).toString()),
                ...userSession.createdPosts.map(id =>
                  (id as ObjectId).toString()
                )
              ).size !==
              tutorDocument.posts.length + userSession.createdPosts.length;

            const hasUserCreatedSession =
              new Set(
                ...tutorDocument.requestedSessions.map(id =>
                  (id as ObjectId).toString()
                ),
                ...userSession.bookedSessions.map(id =>
                  (id as ObjectId).toString()
                )
              ).size !==
              tutorDocument.requestedSessions.length +
                userSession.bookedSessions.length;

            if (!hasUserCreatedPost && !hasUserCreatedSession)
              return res.status(403).json({
                errorMessage:
                  'You must have booked a Session or created a Post to review a Tutor',
              });
            if (tutor._id.toString() === userSession._id.toString()) {
              return res.status(403).json({
                errorMessage: 'As a Tutor you cannot review yourself!',
              });
            }

            const reviewSet = new Set([
              ...tutorDocument.reviews.map(rid => (rid as ObjectId).toString()),
              ...userSession.createdReviews.map(rid =>
                (rid as ObjectId).toString()
              ),
            ]);

            const canUserCreateReview =
              reviewSet.size ===
              userSession.createdReviews.length + tutor.reviews.length;

            if (canUserCreateReview) {
              const sanitizedReqBody = sanitize(req.body);
              const review = await models.Review.create({
                text: sanitizedReqBody?.text,
                stars: Number(sanitizedReqBody.stars),
                tutor: tutorDocument._id,
                user: userSession._id,
              });
              tutor.reviews.push(review);
              userSession.createdReviews.push(review);
              await Promise.all([tutor.calcAvgRating(), userSession.save()]);
              return res.status(201).json({
                ...review.toObject(),
                user: userSession,
                tutor: tutorDocument,
                ownerAuthenticated: true,
              });
            }
            return res.status(403).json({
              errorMessage: 'You have already written a review for this tutor.',
            });
          });
        }
      );
    });
  });
}
