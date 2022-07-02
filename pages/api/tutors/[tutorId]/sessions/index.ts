import sanitize from '../../../../../middleware/mongo-sanitize';
import connectDB from '../../../../../middleware/mongo-connect';
import mongoErrorHandler from '../../../../../middleware/mongo-error-handler';
import serverSideErrorHandler from '../../../../../middleware/server-side-error-handler';
import ensureHttpMethod from '../../../../../middleware/ensure-http-method';
import findTestingUsers from '../../../../../utils/dev-testing-users';
import Session, { SessionDocumentObject } from '../../../../../models/Session';
import User from '../../../../../models/User';
import { authOptions } from '../../../auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { HTTPError } from '../../../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionDocumentObject | HTTPError>
) {
  ensureHttpMethod(req, res, 'POST', async () => {
    await serverSideErrorHandler(req, res, async (req, res) => {
      await connectDB();
      return await mongoErrorHandler(req, res, 'Session', async () => {
        const [session, tutor] = await Promise.all([
          getServerSession({ req, res }, authOptions),
          User.findOne({ _id: req.query.tutorId, isTutor: true }),
        ]);

        const email = session?.user?.email;
        const users = await findTestingUsers();
        let { user: currentUser } = users.user;
        if (email) currentUser = (await User.findOne({ email }))!;

        const sanitizedBody = sanitize(req.body);
        const createdSession = await Session.create({
          ...sanitizedBody,
          hours: Number(sanitizedBody.hours),
          date: new Date(sanitizedBody.date),
          tutorId: tutor._id,
        });

        currentUser.bookedSessions.push(createdSession);
        tutor.requestedSessions.push(createdSession);
        await currentUser.save();
        await tutor.save();

        return res.status(201).json(createdSession.toObject());
      });
    });
  });
}
