import type { NextApiRequest, NextApiResponse } from 'next';
import type { TutorObjectGeoJSON, HTTPError } from '../../../types';

import serverSideErrorHandler from '../../../middleware/server-side-error-handler';
import mongoErrorHandler from '../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../middleware/ensure-http-method';
import connectDB from '../../../middleware/mongo-connect';
import requireAuth from '../../../middleware/require-auth';
import sanitize from '../../../middleware/mongo-sanitize';
import mapbox from '@mapbox/mapbox-sdk/services/geocoding';

const geoCodeClient = mapbox({
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TutorObjectGeoJSON | HTTPError>
) {
  ensureHttpMethod(req, res, 'PUT', () => {
    serverSideErrorHandler(req, res, (req, res) => {
      requireAuth(req, res, 'update a User', async (sessionUser, req, res) => {
        await connectDB();
        mongoErrorHandler(req, res, 'User', async () => {
          const { bio, subjects, location, price } = sanitize(req.body);
          if (
            bio &&
            subjects.length &&
            location &&
            price &&
            Number(price) >= 5 &&
            Number(price) <= 250
          ) {
            const response = await geoCodeClient
              .forwardGeocode({ query: location, limit: 1 })
              .send();
            const { coordinates } = response.body.features[0].geometry;
            sessionUser.isTutor = true;
            sessionUser.geometry = {
              type: 'Point',
              coordinates: coordinates as [number, number],
            };
            sessionUser.bio = bio;
            sessionUser.subjects = subjects.map((s: string) =>
              s.trim().toLowerCase()
            );
            sessionUser.location = location;
            sessionUser.pricePerHour = price;
            await sessionUser.save();
            return res.status(200).json(sessionUser);
          }
          return res.status(400).json({
            errorMessage: `Provide a valid ${
              !bio
                ? 'bio'
                : !subjects.length
                ? 'subjects list'
                : !price || Number(price) < 5 || Number(price) <= 250
                ? 'price'
                : 'location'
            }`,
          });
        });
      });
    });
  });
}
