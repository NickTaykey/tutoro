import connectDB from '../../../../../middleware/mongo-connect';
import { v2 as cloudinary } from 'cloudinary';
import mongoErrorHandler from '../../../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../../../middleware/ensure-http-method';
import serverSideErrorHandler from '../../../../../middleware/server-side-error-handler';
import requireAuth from '../../../../../middleware/require-auth';

import { PostType, HTTPError } from '../../../../../types';
import Post, { PostDocument } from '../../../../../models/Post';
import User, { UserDocument } from '../../../../../models/User';
import { parseForm } from '../../../../../utils/parse-form';
import { unlink } from 'fs';
import type { PostDocumentObject } from '../../../../../models/Post';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { File, Files } from 'formidable';
import type { UploadApiResponse } from 'cloudinary';
import createCheckoutSession from '../../../../../utils/create-checkout-session';
import { getPostDocumentObject } from '../../../../../utils/casting-helpers';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostDocumentObject | HTTPError>
) {
  serverSideErrorHandler(req, res, (req, res) => {
    ensureHttpMethod(req, res, 'POST', () => {
      requireAuth(req, res, 'create a Post', async (userSession, req, res) => {
        await connectDB();
        return mongoErrorHandler(req, res, 'post', async () => {
          const { files, fields } = await parseForm(req, filesUploadConfig);
          if (Object.keys(files).length > 4) {
            deleteFiles(files);
            return res.status(400).json({
              errorMessage: 'You can provide at the most 4 attachments',
            });
          }
          if (!fields.subject)
            return res
              .status(400)
              .json({ errorMessage: 'You have to specify the subject' });
          if (!fields.description)
            return res
              .status(400)
              .json({ errorMessage: 'You have to specify the description' });

          const post = new Post({
            subject: fields.subject,
            description: fields.description,
            type:
              req.query.tutorId === 'global'
                ? PostType.GLOBAL
                : PostType.SPECIFIC,
          });

          const cloudinaryPromises: Promise<UploadApiResponse>[] = [];

          for (const value of Object.values(files)) {
            const file = value as File;
            cloudinaryPromises.push(
              cloudinary.uploader.upload(file.filepath, {
                folder: 'tutoro/attachments/',
                use_filename: true,
                resource_type: file.mimetype?.includes('image')
                  ? 'image'
                  : 'raw',
              })
            );
          }

          const responses = await Promise.all(cloudinaryPromises);

          deleteFiles(files);

          post.attachments = responses.map(r => ({
            public_id: r.public_id,
            url: r.secure_url,
          }));
          post.creator = userSession as UserDocument;
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
            post.answeredBy = tutor as UserDocument;
            post.price = tutor.pricePerPost;
            tutor.posts.push(post._id);
            await tutor.save();
          }
          await Promise.all([post.save(), userSession.save()]);
          return createCheckoutSession(
            getPostDocumentObject(post as PostDocument),
            req,
            res
          );
        });
      });
    });
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
