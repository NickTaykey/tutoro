import connectDB from '../../../../../middleware/mongo-connect';
import sanitize from '../../../../../middleware/mongo-sanitize';
import mongoErrorHandler from '../../../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../../../middleware/ensure-http-method';
import serverSideErrorHandler from '../../../../../middleware/server-side-error-handler';
import requireAuth from '../../../../../middleware/require-auth';

import type { NextApiRequest, NextApiResponse } from 'next';
import { PostType, HTTPError } from '../../../../../types';
import type { PostDocumentObject } from '../../../../../models/Post';
import Post from '../../../../../models/Post';
import User from '../../../../../models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostDocumentObject | HTTPError>
) {
  serverSideErrorHandler(req, res, (req, res) => {
    ensureHttpMethod(req, res, 'POST', () => {
      requireAuth(req, res, 'create a Post', async (userSession, req, res) => {
        await connectDB();
        return mongoErrorHandler(req, res, 'post', async () => {
          const { subject, description } = sanitize(req.body);
          if (!subject)
            return res
              .status(400)
              .json({ errorMessage: 'You have to specify the subject' });
          if (!description)
            return res
              .status(400)
              .json({ errorMessage: 'You have to specify the description' });
          const post = new Post({
            subject,
            description,
            type:
              req.query.tutorId === 'global'
                ? PostType.GLOBAL
                : PostType.SPECIFIC,
          });
          post.creator = userSession._id;
          userSession.createdPosts.push(post._id);
          if (post.type === PostType.SPECIFIC) {
            const tutor = await User.findById(req.query.tutorId);
            if (!tutor)
              return res.status(404).json({ errorMessage: 'Tutor not found' });
            if (!tutor.isTutor)
              return res.status(404).json({
                errorMessage: `The user with id ${tutor._id.toString()} is not a Tutor.`,
              });
            if (tutor._id.toString() === userSession._id.toString())
              return res
                .status(403)
                .json({ errorMessage: 'You cannot create a Post to yourself' });
            post.type = PostType.SPECIFIC;
            post.answeredBy = tutor._id;
            tutor.posts.push(post._id);
            await tutor.save();
          }
          await Promise.all([post.save(), userSession.save()]);
          return res.status(201).json(post.toObject());
        });
      });
    });
  });
}
