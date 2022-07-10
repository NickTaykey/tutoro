import connectDB from '../../../middleware/mongo-connect';
import sanitize from '../../../middleware/mongo-sanitize';
import mongoErrorHandler from '../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../middleware/ensure-http-method';
import serverSideErrorHandler from '../../../middleware/server-side-error-handler';
import requireAuth from '../../../middleware/require-auth';
import Post from '../../../models/Post';
import { PostType } from '../../../types';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { PostDocumentObject } from '../../../models/Post';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostDocumentObject>
) {
  serverSideErrorHandler(req, res, (req, res) => {
    ensureHttpMethod(req, res, 'POST', async () => {
      await connectDB();
      return mongoErrorHandler(req, res, 'post', async () => {
        requireAuth(
          req,
          res,
          'create a Post',
          async (userSession, req, res) => {
            const { subject, description } = sanitize(req.body);
            if (!subject)
              return res
                .status(400)
                .json({ errrorMessage: 'You have to specify the subject' });
            if (!description)
              return res.status(400).json({
                errrorMessage: 'You have to specify the description',
              });
            const newPost = new Post({
              subject,
              description,
              type: PostType.GLOBAL,
            });
            newPost.creator = userSession._id;
            userSession.createdPosts.push(newPost._id);
            await Promise.all([newPost.save(), userSession.save()]);
            return res.status(201).json(newPost.toObject());
          }
        );
      });
    });
  });
}
