import type { ExtendedRequest } from '../../../../utils/types';
import type { NextApiResponse } from 'next';

import { getUserDocumentObject } from '../../../../utils/casting-helpers';
import onError from '../../../../middleware/server-error-handler';
import requireAuth from '../../../../middleware/require-auth';
import mapbox from '@mapbox/mapbox-sdk/services/geocoding';
import sanitize from '../../../../utils/mongo-sanitize';
import { createRouter } from 'next-connect';

const geoCodeClient = mapbox({
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!,
});

const router = createRouter<ExtendedRequest, NextApiResponse>();

router.put(
  requireAuth('You have to be authenticated to update your profile'),
  async (req, res) => {
    const { bio, subjects, location, sessionPricePerHour, pricePerPost } =
      sanitize(req.body);

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

      req.sessionUser.isTutor = true;
      req.sessionUser.geometry = {
        type: 'Point',
        coordinates: coordinates as [number, number],
      };
      req.sessionUser.bio = bio;
      req.sessionUser.subjects = subjects.map((s: string) =>
        s.trim().toLowerCase()
      );
      req.sessionUser.location = location;
      req.sessionUser.sessionPricePerHour = sessionPricePerHour;
      req.sessionUser.pricePerPost = pricePerPost;
      await req.sessionUser.save();

      return res.status(200).json(getUserDocumentObject(req.sessionUser));
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
  }
);

export default router.handler({ onError });
