import onError from '../../../../../../middleware/server-error-handler';
import { PostStatus, PostType } from '../../../../../../utils/types';
import requireAuth from '../../../../../../middleware/require-auth';
import { ExtendedRequest } from '../../../../../../utils/types';
import { parseForm } from '../../../../../../utils/parse-form';
import { v2 as cloudinary } from 'cloudinary';
import { createRouter } from 'next-connect';
import { unlink } from 'fs';

import type { PostDocument } from '../../../../../../models/Post';
import type { UploadApiResponse } from 'cloudinary';
import type { File, Files } from 'formidable';
import type { NextApiResponse } from 'next';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteFiles = (files: Files) => {
  for (const value of Object.values(files)) {
    const file = value as File;
    unlink(file.filepath, () => {});
  }
};

const filesUploadConfig = {
  maxFiles: 4,
  dir: '/attachments',
  multiple: true,
  filter: () => true,
};

const router = createRouter<ExtendedRequest, NextApiResponse>();

router
  .use(
    requireAuth('You have to be authenticated to change the state of a Post')
  )
  .put(async (req, res) => {
    if (req.method === 'PUT') {
      const [post, { files, fields }] = await Promise.all([
        req.models.Post.findById(req.query.postId),
        parseForm(req, filesUploadConfig),
      ]);
      const postDocument = post as PostDocument;

      if (!req.sessionUser.isTutor) {
        return res.status(403).json({
          errorMessage: 'Only a Tutor can answer a Post',
        });
      }

      if (Object.keys(files).length > 4) {
        deleteFiles(files);
        return res.status(400).json({
          errorMessage: 'You can provide at the most 4 attachments',
        });
      }

      postDocument.answer = fields.text as string;
      postDocument.status = PostStatus.ANSWERED;

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

      postDocument.answerAttachments = responses.map(r => ({
        public_id: r.public_id,
        url: r.secure_url,
      }));

      const userPostDocuments = req.sessionUser.posts as PostDocument[];
      const postIndex = userPostDocuments.findIndex(
        ({ _id }) => _id.toString() === postDocument._id.toString()
      );

      if (postDocument.type === PostType.GLOBAL && postIndex === -1) {
        postDocument.answeredBy = req.sessionUser._id;
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
    }
  });

export default router.handler({
  onError,
});

export const config = {
  api: {
    bodyParser: false,
  },
};
