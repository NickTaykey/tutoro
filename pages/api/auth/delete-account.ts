import onError from '../../../middleware/server-error-handler';
import requireAuth from '../../../middleware/require-auth';
import cloudinary from '../../../utils/cloudinary-config';
import { createRouter } from 'next-connect';
import User from '../../../models/User';
import sgMail from '@sendgrid/mail';

import type { ExtendedRequest } from '../../../utils/types';
import type { NextApiResponse } from 'next';

import type { SessionDocument } from '../../../models/Session';
import type { ReviewDocument } from '../../../models/Review';
import type { PostDocument } from '../../../models/Post';
import type { UserDocument } from '../../../models/User';
import type { ObjectId } from 'mongoose';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const router = createRouter<ExtendedRequest, NextApiResponse>();

router
  .use(requireAuth('You need to be authenticated to modify a Review'))
  .delete(async (req, res) => {
    await Promise.all([
      req.sessionUser.populate('bookedSessions'),
      req.sessionUser.populate('createdReviews'),
      req.sessionUser.populate('createdPosts'),
      req.sessionUser.populate('requestedSessions'),
      req.sessionUser.populate('reviews'),
      req.sessionUser.populate('posts'),
    ]);

    const emailMessage = {
      to: req.sessionUser.email,
      from: 'authteam.tutorbookingapp@gmail.com',
      subject: 'Your Tutor account has been successfully deleted',
      html: `Every resource that you created is not available anymore.
          Moreover, all the media that you uploaded on our platform have been deleted.
          The only way to join Tutoro is to create another account.
          Bye`.replace(/			/g, ''),
    };

    const {
      bookedSessions,
      createdReviews,
      createdPosts,
      requestedSessions,
      reviews,
      posts,
    } = req.sessionUser;

    await Promise.all([
      ...([...bookedSessions, ...requestedSessions] as SessionDocument[]).map(
        s => deleteSession(s)
      ),
      ...([...createdPosts, ...posts] as PostDocument[]).map(p =>
        deletePost(p)
      ),
      ...([...createdReviews, ...reviews] as ReviewDocument[]).map(r =>
        r.remove()
      ),
    ]);

    if (req.sessionUser.avatar && req.sessionUser.avatar.public_id) {
      cloudinary.uploader.destroy(req.sessionUser.avatar.public_id);
    }

    // sgMail.send(emailMessage);
    await req.sessionUser.remove();

    return res.status(200).end();
  });

const deletePost = (post: PostDocument) => {
  return new Promise<null>(async resolve => {
    const [user, tutor]: UserDocument[] = await Promise.all([
      User.findById(post.creator),
      User.findById(post.answeredBy),
    ]);

    user.createdPosts = (user.createdPosts as ObjectId[]).filter(
      id => id.toString() !== post._id.toString()
    );

    if (tutor) {
      tutor.posts = (tutor.posts as ObjectId[]).filter(
        (id: ObjectId) => id.toString() !== post._id.toString()
      );
    }

    await Promise.all([post.remove(), tutor.save(), user.save()]);
    return resolve(null);
  });
};

const deleteSession = (session: SessionDocument) => {
  return new Promise<null>(async resolve => {
    const [user, tutor]: UserDocument[] = await Promise.all([
      User.findById(session.user.toString()),
      User.findById(session.tutor.toString()),
    ]);

    user.bookedSessions = (user.bookedSessions as ObjectId[]).filter(
      id => id.toString() !== session._id.toString()
    );
    tutor.requestedSessions = (tutor.requestedSessions as ObjectId[]).filter(
      (id: ObjectId) => id.toString() !== session._id.toString()
    );

    await Promise.all([session.remove(), tutor.save(), user.save()]);
    return resolve(null);
  });
};

export default router.handler({
  onError,
});
