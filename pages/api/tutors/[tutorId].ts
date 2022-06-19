import type { NextApiRequest, NextApiResponse } from 'next';
import type { TutorObjectGeoJSON } from '../../../types';
import fakeTutors from '../../../fake-tutors.json';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TutorObjectGeoJSON | {}>
) {
  const tutor = fakeTutors.features.find(
    t => t.properties._id === req.query.tutorId
  );
  res.status(200).json(tutor ? tutor : {});
}
