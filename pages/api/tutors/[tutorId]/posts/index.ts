import createCheckoutSession from '../../../../../utils/create-checkout-session';
import { getPostDocumentObject } from '../../../../../utils/casting-helpers';
import { PostType, ExtendedRequest } from '../../../../../utils/types';
import onError from '../../../../../middleware/server-error-handler';
import requireAuth from '../../../../../middleware/require-auth';
import { createRouter } from 'next-connect';

import type { UserDocument } from '../../../../../models/User';
import type { PostDocument } from '../../../../../models/Post';
import type { NextApiResponse } from 'next';

const router = createRouter<ExtendedRequest, NextApiResponse>();

router
  .use(requireAuth('You need to be authenticated to create a Post'))
  .post(async (req, res) => {
    const { subject, description, attachments } = req.body;

    if (!subject) {
      return res
        .status(400)
        .json({ errorMessage: 'You have to specify the subject' });
    }

    if (!description) {
      return res
        .status(400)
        .json({ errorMessage: 'You have to specify the description' });
    }

    const post = new req.models.Post({
      subject,
      description,
      attachments,
      creator: req.sessionUser,
      type:
        req.query.tutorId === 'global' ? PostType.GLOBAL : PostType.SPECIFIC,
    }) as PostDocument;

    req.sessionUser.createdPosts.push(post._id);

    if (post.type === PostType.SPECIFIC) {
      const tutor = (await req.models.User.findById(
        req.query.tutorId
      )) as UserDocument;

      if (!tutor)
        return res.status(404).json({ errorMessage: 'Tutor not found' });
      if (!tutor.isTutor)
        return res.status(404).json({
          errorMessage: `The user with id ${tutor._id.toString()} is not a Tutor.`,
        });
      if (tutor._id.toString() === req.sessionUser._id.toString())
        return res.status(403).json({
          errorMessage: 'You cannot create a Post to yourself',
        });
      post.answeredBy = tutor as UserDocument;
      post.price = tutor.pricePerPost;
      tutor.posts.push(post._id);

      await tutor.save();
    }

    await Promise.all([post.save(), req.sessionUser.save()]);

    return createCheckoutSession(
      getPostDocumentObject(post as PostDocument),
      req,
      res
    );
  });

export default router.handler({
  onError,
});
