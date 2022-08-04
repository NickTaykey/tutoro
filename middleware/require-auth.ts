import type { ExtendedRequest } from '../utils/types';
import type { UserDocument } from '../models/User';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { NextHandler } from 'next-connect';
import { NextApiResponse } from 'next';
import * as models from '../models';

function requireAuth(userNotAuthenticatedMessage: string) {
  return async (
    req: ExtendedRequest,
    res: NextApiResponse,
    next: NextHandler
  ) => {
    const session = await getServerSession({ req, res }, authOptions);
    if (session?.user?.email) {
      const { _id } = session.user as UserDocument;
      const user = await models.User.findById(_id);
      req.sessionUser = user as UserDocument;
      req.models = models;
      return next();
    }
    return res.status(403).json({
      errorMessage: userNotAuthenticatedMessage,
    });
  };
}

export default requireAuth;
