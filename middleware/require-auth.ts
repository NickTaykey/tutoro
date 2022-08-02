import connectionPromise from './mongo-connect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import User from '../models/User';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { UserDocument } from '../models/User';
import type { Mongoose } from 'mongoose';

const requireAuth = async (
  req: NextApiRequest,
  res: NextApiResponse,
  contextMessage: string,
  cb: (
    connection: Mongoose,
    sessionUser: UserDocument,
    req: NextApiRequest,
    res: NextApiResponse
  ) => void
) => {
  const [session, connection] = await Promise.all([
    getServerSession({ req, res }, authOptions),
    connectionPromise,
  ]);
  if (session?.user?.email) {
    const { _id } = session.user as UserDocument;
    const user = await User.findById(_id);
    const userDocument = user as UserDocument;
    return cb(connection, userDocument, req, res);
  }
  return res.status(403).json({
    errorMessage: `You have to be authenticated to ${contextMessage}.`,
  });
};

export default requireAuth;
