import type { NextApiRequest, NextApiResponse } from 'next';
import type { FakeTutorsAPIResponseType } from '../../types';
import fakeTutors from '../../fake-tutors.json';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<FakeTutorsAPIResponseType>
) {
  res.status(200).json(fakeTutors as FakeTutorsAPIResponseType);
}
