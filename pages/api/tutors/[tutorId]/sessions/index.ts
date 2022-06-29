import type { NextApiRequest, NextApiResponse } from 'next';
import type { ISession, HTTPError } from '../../../../../types';
import connectDB from '../../../../../middleware/mongo-connect';
import mongoErrorHandler from '../../../../../middleware/mongo-error-handler';
import Session from '../../../../../models/Session';
import sanitize from '../../../../../middleware/mongo-sanitize';
import { authOptions } from '../../../auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import User from '../../../../../models/User';
import ensureHttpMethod from '../../../../../middleware/ensure-http-method';
import serverSideErrorHandler from '../../../../../middleware/server-side-error-handler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ISession | HTTPError>
) {
  ensureHttpMethod(req, res, 'POST', async () => {
    await serverSideErrorHandler(req, res, async (req, res) => {
      await connectDB();
      return await mongoErrorHandler(req, res, 'Session', async () => {
        const [session, tutor] = await Promise.all([
          getServerSession({ req, res }, authOptions),
          User.findOne({ _id: req.query.tutorId, isTutor: true }),
        ]);
        const user = await User.findOne({ email: session?.user?.email });
        const sanitizedBody = sanitize(req.body);
        const createdSession = await Session.create({
          ...sanitizedBody,
          hours: Number(sanitizedBody.hours),
          date: new Date(sanitizedBody.date),
        });
        user.bookedSessions.push(createdSession);
        tutor.requestedSessions.push(createdSession);
        await user.save();
        await tutor.save();
        return res.status(201).json(createdSession.toObject());
      });
    });
  });
}
