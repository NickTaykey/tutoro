import type { NextApiRequest, NextApiResponse } from 'next';
import type { TutorObjectGeoJSON, HTTPError } from '../../../types';

import serverSideErrorHandler from '../../../middleware/server-side-error-handler';
import mongoErrorHandler from '../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../middleware/ensure-http-method';
import connectDB from '../../../middleware/mongo-connect';
import sanitize from '../../../middleware/mongo-sanitize';
import User from '../../../models/User';
import mapbox from '@mapbox/mapbox-sdk/services/geocoding';

const geoCodeClient = mapbox({
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!,
});

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TutorObjectGeoJSON | HTTPError>
) {
  ensureHttpMethod(req, res, 'GET', () => {
    serverSideErrorHandler(req, res, async (req, res) => {
      await connectDB();
      mongoErrorHandler(req, res, 'User', async () => {
        let coordinates: number[] | null = null;
        const {
          location,
          subject,
          name,
          priceMin,
          priceMax,
          distance,
          starsMin,
          starsMax,
        } = sanitize(req.query);
        let query: Array<any> = [];
        if (subject) {
          query.push({ subjects: subject.toLowerCase() });
        }
        if (name) {
          query.push({ fullname: new RegExp(name, 'i') });
        }
        if (+priceMin && +priceMin >= 5 && +priceMin <= 250) {
          query.push({ pricePerHour: { $gte: +priceMin } });
        }
        if (+priceMax && +priceMax >= 5 && +priceMax <= 250) {
          query.push({ pricePerHour: { $lte: +priceMax } });
        }
        if (+starsMin && +starsMin >= 0 && +starsMin <= 5) {
          query.push({ avgRating: { $gte: +starsMin } });
        }
        if (+priceMax && +priceMax >= 0 && +starsMax <= 5) {
          query.push({ avgRating: { $lte: +starsMax } });
        }
        if (location && Number(distance)) {
          coordinates = location.split(',').map((s: string) => +s);
          if (coordinates && (!coordinates[0] || !coordinates[1])) {
            const response = await geoCodeClient
              .forwardGeocode({ query: location, limit: 1 })
              .send();
            coordinates = response.body.features[0].geometry.coordinates;
          }
          query.push({
            geometry: {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates,
                },
                $maxDistance: Number(distance) * 1000,
              },
            },
          });
        }
        const filteredTutors = await User.find({ $and: query });
        res
          .status(200)
          .json({ tutors: filteredTutors, geoLocatedUser: coordinates });
      });
    });
  });
}
