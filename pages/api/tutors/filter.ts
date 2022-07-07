import type { NextApiRequest, NextApiResponse } from 'next';
import type { TutorObjectGeoJSON, HTTPError } from '../../../types';

import serverSideErrorHandler from '../../../middleware/server-side-error-handler';
import mongoErrorHandler from '../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../middleware/ensure-http-method';
import connectDB from '../../../middleware/mongo-connect';
import sanitize from '../../../middleware/mongo-sanitize';
import User from '../../../models/User';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TutorObjectGeoJSON | HTTPError>
) {
  ensureHttpMethod(req, res, 'GET', () => {
    serverSideErrorHandler(req, res, async (req, res) => {
      await connectDB();
      mongoErrorHandler(req, res, 'User', async () => {
        const { location, subject, name, priceMin, priceMax, distance } =
          sanitize(req.query);
        console.log(subject);
        let query: any = {};
        if (subject) query.subjects = subject.toLowerCase();
        if (name) query.fullname = new RegExp(name, 'i');
        if (+priceMin && +priceMin >= 5 && +priceMin <= 250)
          query.pricePerHour = { $gte: priceMin };
        if (+priceMax && +priceMax >= 5 && +priceMax <= 250) {
          query.pricePerHour = !!query.pricePerHour
            ? { ...query.pricePerHour, $lte: priceMax }
            : { $lte: priceMax };
        }
        const filteredTutors = await User.find({ isTutor: true, ...query });
        res.status(200).json(filteredTutors);
      });
    });
  });
}
