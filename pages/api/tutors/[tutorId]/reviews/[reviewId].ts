import sanitize from '../../../../../middleware/mongo-sanitize';
import connectDB from '../../../../../middleware/mongo-connect';
import Review, { ReviewDocumentObject } from '../../../../../models/Review';
import User from '../../../../../models/User';
import { authOptions } from '../../../auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import serverSideErrorHandler from '../../../../../middleware/server-side-error-handler';
import mongoErrorHandler from '../../../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../../../middleware/ensure-http-method';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ObjectId } from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReviewDocumentObject>
) {
  ensureHttpMethod(req, res, ['DELETE', 'PUT'], async () => {
    await serverSideErrorHandler(req, res, async (req, res) => {
      await connectDB();
      const session = await getServerSession({ req, res }, authOptions);
      const user = await User.findOne({ email: session?.user?.email });

      if (!user) {
        return res.status(403).json({
          errorMessage: 'You have to be authenticated to use this ruote',
        });
      }

      const doesReviewExist: boolean = user.createdReviews
        .map((reviewId: ObjectId) => reviewId.toString())
        .includes(req.query.reviewId);

      if (doesReviewExist) {
        if (req.method === 'DELETE') {
          await mongoErrorHandler(req, res, 'User', async () => {
            const tutor = await User.findOne({
              isTutor: true,
              _id: req.query.tutorId,
            });
            if (!tutor) {
              return res.status(404).json({ errorMessage: 'User not found' });
            }
            const review = await Review.findByIdAndDelete(req.query.reviewId);
            user.createdReviews = user.createdReviews.filter(
              (reviewId: ObjectId) => reviewId.toString() !== req.query.reviewId
            );
            await user.save();
            res.status(200).json(review.toJSON());
          });
        } else if (req.method === 'PUT') {
          await mongoErrorHandler(req, res, 'Review', async () => {
            const review = await Review.findByIdAndUpdate(
              req.query.reviewId,
              sanitize(req.body),
              { runValidators: true, new: true }
            );
            res.status(200).json(review.toJSON());
          });
        }
      } else res.status(404).json({ errorMessage: 'Review not found' });
    });
  });
}
