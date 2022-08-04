import onError from '../../../middleware/server-error-handler';
import mapbox from '@mapbox/mapbox-sdk/services/geocoding';
import sanitize from '../../../utils/mongo-sanitize';
import { createRouter } from 'next-connect';
import * as models from '../../../models';

import type { NextApiRequest, NextApiResponse } from 'next';

const geoCodeClient = mapbox({
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!,
});

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
  let coordinates: number[] | null = null;
  const {
    location,
    subject,
    name,
    sessionPriceMin,
    sessionPriceMax,
    postPriceMin,
    postPriceMax,
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
  if (+sessionPriceMin && +sessionPriceMin >= 5 && +sessionPriceMin <= 250) {
    query.push({ sessionPricePerHour: { $gte: +sessionPriceMin } });
  }
  if (+sessionPriceMax && +sessionPriceMax >= 5 && +sessionPriceMax <= 250) {
    query.push({ sessionPricePerHour: { $lte: +sessionPriceMax } });
  }
  if (+postPriceMin && +postPriceMin >= 5 && +postPriceMin <= 50) {
    query.push({ pricePerPost: { $gte: +postPriceMin } });
  }
  if (+postPriceMax && +postPriceMax >= 5 && +postPriceMax <= 250) {
    query.push({ pricePerPost: { $lte: +postPriceMax } });
  }
  if (+starsMin && +starsMin >= 0 && +starsMin <= 5) {
    query.push({ avgRating: { $gte: +starsMin } });
  }
  if (+sessionPriceMax && +sessionPriceMax >= 0 && +starsMax <= 5) {
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

  const filteredTutors = await models.User.find({ $and: query });
  res.status(200).json({ tutors: filteredTutors });
});

export default router.handler({
  onError,
});
