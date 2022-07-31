import connectDB from '../../../../../../middleware/mongo-connect';
import mongoErrorHandler from '../../../../../../middleware/mongo-error-handler';
import ensureHttpMethod from '../../../../../../middleware/ensure-http-method';
import serverSideErrorHandler from '../../../../../../middleware/server-side-error-handler';
import requireAuth from '../../../../../../middleware/require-auth';
import Post from '../../../../../../models/Post';
import { v2 as cloudinary } from 'cloudinary';
import { PostStatus, PostType } from '../../../../../../types';
import { parseForm } from '../../../../../../utils/parse-form';
import { unlink } from 'fs';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { UploadApiResponse } from 'cloudinary';
import type { File, Files } from 'formidable';
import type {
  PostDocument,
  PostDocumentObject,
} from '../../../../../../models/Post';
import TutorPage from '../../../../../../components/tutors/TutorPage';
import { UserDocument } from '../../../../../../models/User';

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
            const { files, fields } = await parseForm(req, filesUploadConfig);
            if (!userSession.isTutor) {
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
            post.answer = fields.text;
            post.status = PostStatus.ANSWERED;
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

            post.answerAttachments = responses.map(r => ({
              public_id: r.public_id,
              url: r.secure_url,
            }));

            if (
              post.type === PostType.GLOBAL &&
              userSession.posts.findIndex(
                p => (p as PostDocument)._id.toString() === post._id.toString()
              ) === -1
            ) {
              post.answeredBy = userSession._id;
              post.type = PostType.SPECIFIC;
              userSession.posts.push(post._id);
            }
            if (userSession.posts.length) {
              await userSession.populate('posts');
              userSession.postEarnings = (
                userSession.posts as PostDocument[]
              ).reduce(
                (acm: number, post: PostDocument) => (acm += post.price),
                0
              );
            }
            await Promise.all([post.save(), userSession.save()]);
            return res.status(200).json(post.toObject());
          }
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
