import mongoErrorHandler from '../../../../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../../../../middleware/ensure-http-method';
import serverSideErrorHandler from '../../../../../../middleware/server-side-error-handler';
import requireAuth from '../../../../../../middleware/require-auth';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { PostDocumentObject } from '../../../../../../models/Post';
import { PostStatus, HTTPError, PostType } from '../../../../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostDocumentObject | HTTPError>
) {
  serverSideErrorHandler(req, res, (req, res) => {
    ensureHttpMethod(req, res, 'PUT', () => {
      requireAuth(
        req,
        res,
        'delete a Post',
        async ({ models }, userSession, req, res) => {
          return mongoErrorHandler(req, res, 'post', async () => {
            const post = await models.Post.findById(req.query.postId);
            if (
              userSession.posts.includes(post._id) ||
              post.type === PostType.GLOBAL
            ) {
              post.status =
                PostStatus.CLOSED === post.status
                  ? PostStatus.NOT_ANSWERED
                  : PostStatus.CLOSED;
              await post.save();
              return res.status(201).json(post.toObject());
            }
            return res.status(403).json({
              errorMessage: 'You are not authorized to close this post',
            });
          });
        }
      );
    });
  });
}
