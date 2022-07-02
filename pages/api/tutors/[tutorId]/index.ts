import type { NextApiRequest, NextApiResponse } from 'next';
import type { TutorObjectGeoJSON, HTTPError } from '../../../../types';

import serverSideErrorHandler from '../../../../middleware/server-side-error-handler';
import mongoErrorHandler from '../../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../../middleware/ensure-http-method';
import connectDB from '../../../../middleware/mongo-connect';
import Review from '../../../../models/Review';
import User from '../../../../models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TutorObjectGeoJSON | HTTPError>
) {
  ensureHttpMethod(req, res, 'GET', () => {
    serverSideErrorHandler(req, res, async (req, res) => {
      await connectDB();
      mongoErrorHandler(req, res, 'User', async () => {
        const tutor = await User.findById(req.query.tutorId)
          .populate({
            path: 'reviews',
            options: {
              sort: { _id: -1 },
            },
            model: Review,
          })
          .exec();
        return res.status(200).json(tutor ? tutor : {});
      });
    });
  });
}
