import type { NextApiRequest, NextApiResponse } from 'next';
import type { TutorObjectGeoJSON, HTTPError } from '../../../../types';

import serverSideErrorHandler from '../../../../middleware/server-side-error-handler';
import mongoErrorHandler from '../../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../../middleware/ensure-http-method';
import connectDB from '../../../../middleware/mongo-connect';
import requireAuth from '../../../../middleware/require-auth';
import sanitize from '../../../../middleware/mongo-sanitize';

import mapbox from '@mapbox/mapbox-sdk/services/geocoding';
import { getUserDocumentObject } from '../../../../utils/casting-helpers';

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
          const {
            globalPostsEnabled,
            bio,
            subjects,
            location,
            sessionPricePerHour,
            pricePerPost,
          } = sanitize(req.body);
          if (globalPostsEnabled) {
            sessionUser.globalPostsEnabled = eval(globalPostsEnabled);
            sessionUser.save();
            return res.status(200);
          }

          if (
            bio &&
            subjects.length &&
            location &&
            sessionPricePerHour &&
            Number(sessionPricePerHour) >= 5 &&
            Number(sessionPricePerHour) <= 250 &&
            pricePerPost &&
            Number(pricePerPost) >= 5 &&
            Number(pricePerPost) <= 250
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
            sessionUser.sessionPricePerHour = sessionPricePerHour;
            sessionUser.pricePerPost = pricePerPost;
            await sessionUser.save();
            return res.status(200).json(getUserDocumentObject(sessionUser));
          }

          return res.status(400).json({
            errorMessage: `Provide a valid ${
              !bio
                ? 'bio'
                : !subjects.length
                ? 'subjects list'
                : !sessionPricePerHour ||
                  Number(sessionPricePerHour) < 5 ||
                  Number(sessionPricePerHour) <= 250
                ? 'Session price per hour'
                : !pricePerPost ||
                  Number(pricePerPost) < 5 ||
                  Number(pricePerPost) <= 250
                ? 'Post price'
                : 'location'
            }`,
          });
        });
      });
    });
  });
}
