import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import findTestingUsers from '../utils/dev-testing-users';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { UserDocument, UserDocumentObject } from '../models/User';
import User from '../models/User';

const requireAuth = async (
  req: NextApiRequest,
  res: NextApiResponse,
  cb: (
    sessionUser: UserDocument,
    req: NextApiRequest,
    res: NextApiResponse
  ) => void
): Promise<unknown> => {
  // === ONLY FOR DEVELOPMENT PORPOSE REMOVE IN PRODUCTION
  const session = await getServerSession({ req, res }, authOptions);
  const users = await findTestingUsers();
  let { user: currentUser } = users.user;
  if (session?.user) {
    const user = await User.findById((session.user as UserDocument)._id);
    return cb(user as UserDocument, req, res);
  }
  return cb(currentUser as UserDocument, req, res);
  // ===
  // === PRODUCTION CODE
  /* if (session?.user) return cb(session.user as UserDocumentObject, req, res);
  return res.status(403).json({
    errorMessage: 'You have to be authenticated to create a Review.',
  }); */
};

export default requireAuth;
