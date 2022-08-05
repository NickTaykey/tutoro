import createCheckoutSession from '../../../../../utils/create-checkout-session';
import { getPostDocumentObject } from '../../../../../utils/casting-helpers';
import { PostType, ExtendedRequest } from '../../../../../utils/types';
import onError from '../../../../../middleware/server-error-handler';
import requireAuth from '../../../../../middleware/require-auth';
import cloudinary from '../../../../../utils/cloudinary-config';
import { parseForm } from '../../../../../utils/parse-form';
import { createRouter } from 'next-connect';
import { unlink } from 'fs';

import type { UserDocument } from '../../../../../models/User';
import type { PostDocument } from '../../../../../models/Post';
import type { UploadApiResponse } from 'cloudinary';
import type { File, Files } from 'formidable';
import type { NextApiResponse } from 'next';

const filesUploadConfig = {
  maxFiles: 4,
  dir: '/attachments',
  multiple: true,
  filter: () => true,
};

const deleteFiles = (files: Files) => {
  for (const value of Object.values(files)) {
    const file = value as File;
    unlink(file.filepath, () => {});
  }
};

const router = createRouter<ExtendedRequest, NextApiResponse>();

router
  .use(requireAuth('You need to be authenticated to create a Post'))
  .post(async (req, res) => {
    const { files, fields } = await parseForm(req, filesUploadConfig);

    if (Object.keys(files).length > 4) {
      deleteFiles(files);
      return res.status(400).json({
        errorMessage: 'You can provide at the most 4 attachments',
      });
    }

    if (!fields.subject) {
      return res
        .status(400)
        .json({ errorMessage: 'You have to specify the subject' });
    }

    if (!fields.description) {
      return res
        .status(400)
        .json({ errorMessage: 'You have to specify the description' });
    }

    const post = new req.models.Post({
      subject: fields.subject,
      description: fields.description,
      type:
        req.query.tutorId === 'global' ? PostType.GLOBAL : PostType.SPECIFIC,
    }) as PostDocument;

    const cloudinaryPromises: Promise<UploadApiResponse>[] = [];

    for (const value of Object.values(files)) {
      const file = value as File;
      cloudinaryPromises.push(
        cloudinary.uploader.upload(file.filepath, {
          folder: 'tutoro/attachments/',
          use_filename: true,
          resource_type: file.mimetype?.includes('image') ? 'image' : 'raw',
        })
      );
    }

    const responses = await Promise.all(cloudinaryPromises);

    deleteFiles(files);

    post.attachments = responses.map(r => ({
      public_id: r.public_id,
      url: r.secure_url,
    }));
    post.creator = req.sessionUser;
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

export const config = {
  api: {
    bodyParser: false,
  },
};
