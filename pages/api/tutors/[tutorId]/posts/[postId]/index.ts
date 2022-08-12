import onError from '../../../../../../middleware/server-error-handler';
import { PostStatus, PostType } from '../../../../../../utils/types';
import requireAuth from '../../../../../../middleware/require-auth';
import { ExtendedRequest } from '../../../../../../utils/types';
import { createRouter } from 'next-connect';

import type { PostDocument } from '../../../../../../models/Post';
import type { NextApiResponse } from 'next';

const router = createRouter<ExtendedRequest, NextApiResponse>();

router
  .use(
    requireAuth('You have to be authenticated to change the state of a Post')
  )
  .put(async (req, res) => {
    const post = await req.models.Post.findById(req.query.postId).populate(
      'answeredBy'
    );
    const postDocument = post as PostDocument;

    if (!req.sessionUser.isTutor) {
      return res.status(403).json({
        errorMessage: 'Only a Tutor can answer a Post',
      });
    }

    postDocument.answer = req.body.answer;
    postDocument.status = PostStatus.ANSWERED;
    postDocument.answerAttachments = req.body.answerAttachments;

    const userPostDocuments = req.sessionUser.posts as PostDocument[];
    const postIndex = userPostDocuments.findIndex(
      ({ _id }) => _id.toString() === postDocument._id.toString()
    );

    if (postDocument.type === PostType.GLOBAL && postIndex === -1) {
      postDocument.answeredBy = req.sessionUser;
      postDocument.type = PostType.SPECIFIC;
      req.sessionUser.posts.push(postDocument._id);
    }

    if (req.sessionUser.posts.length) {
      await req.sessionUser.populate('posts');
      req.sessionUser.postEarnings = userPostDocuments.reduce(
        (acm: number, post: PostDocument) => (acm += post.price),
        0
      );
    }

    await Promise.all([postDocument.save(), req.sessionUser.save()]);
    return res.status(200).json(postDocument.toObject());
  });

export default router.handler({
  onError,
});
