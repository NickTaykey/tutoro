import connectDB from '../../../../../../middleware/mongo-connect';
import mongoErrorHandler from '../../../../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../../../../middleware/ensure-http-method';
import serverSideErrorHandler from '../../../../../../middleware/server-side-error-handler';
import requireAuth from '../../../../../../middleware/require-auth';
import sanitize from '../../../../../../middleware/mongo-sanitize';

import type { NextApiRequest, NextApiResponse } from 'next';
import type {
  PostDocument,
  PostDocumentObject,
} from '../../../../../../models/Post';
import Post from '../../../../../../models/Post';
import { PostStatus, PostType } from '../../../../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostDocumentObject>
) {
  serverSideErrorHandler(req, res, (req, res) => {
    ensureHttpMethod(req, res, ['DELETE', 'PUT'], () => {
      requireAuth(req, res, 'delete a Post', async (userSession, req, res) => {
        await connectDB();
        return mongoErrorHandler(req, res, 'post', async () => {
          const post = await Post.findById(req.query.postId);
          if (req.method === 'DELETE') {
            await post.remove();
            return res.status(200).json(post.toObject());
          }
          if (req.method === 'PUT') {
            post.answer = sanitize(req.body).answer;
            post.status = PostStatus.ANSWERED;
            if (
              post.type === PostType.GLOBAL &&
              userSession.posts.findIndex(
                p => (p as PostDocument)._id.toString() === post._id.toString()
              ) === -1
            ) {
              post.answeredBy = userSession._id;
              userSession.posts.push(post._id);
            }
            await Promise.all([post.save(), userSession.save()]);
            return res.status(200).json(post.toObject());
          }
        });
      });
    });
  });
}
