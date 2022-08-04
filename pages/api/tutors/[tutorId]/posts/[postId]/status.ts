import {
  PostStatus,
  PostType,
  ExtendedRequest,
} from '../../../../../../utils/types';
import onError from '../../../../../../middleware/server-error-handler';
import requireAuth from '../../../../../../middleware/require-auth';
import { createRouter } from 'next-connect';

import type { PostDocument } from '../../../../../../models/Post';
import type { NextApiResponse } from 'next';

const router = createRouter<ExtendedRequest, NextApiResponse>();

router
  .use(
    requireAuth('You have to be authenticated to change the state of a Post')
  )
  .put(async (req, res) => {
    const post = (await req.models.Post.findById(
      req.query.postId
    )) as PostDocument;

    if (
      req.sessionUser.posts.includes(post._id) ||
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
      errorMessage:
        'You have to be authenticated to change the state of a Post',
    });
  });

export default router.handler({
  onError,
});
