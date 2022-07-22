import type { NextApiRequest, NextApiResponse } from 'next';
import { parseForm, FormidableError } from '../../utils/parse-form';
import { v2 as cloudinary } from 'cloudinary';
import requireAuth from '../../middleware/require-auth';
import ensureHttpMethod from '../../middleware/ensure-http-method';
import fs, { PathLike } from 'fs';
import type { CloudFile } from '../../types';
import type { File, Part } from 'formidable';
import type { UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const avatarUploadConfig = {
  maxFiles: 1,
  dir: '/avatars',
  filter: (part: Part) => part.name === 'avatar' || false,
  multiple: false,
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{
    newAvatar: CloudFile | null;
    error: string | null;
  }>
) => {
  ensureHttpMethod(req, res, 'PUT', (req, res) => {
    requireAuth(
      req,
      res,
      'change your avatar',
      async (sessionUser, req, res) => {
        try {
          const { files } = await parseForm(req, avatarUploadConfig);
          const file = files.avatar as File;
          if (file) {
            if (!!sessionUser.avatar?.public_id && !!sessionUser.avatar?.url) {
              cloudinary.uploader.destroy(sessionUser.avatar.public_id);
            }
            const cloudinaryResponse: UploadApiResponse =
              await cloudinary.uploader.upload(file.filepath, {
                folder: 'tutoro/avatars/',
              });
            sessionUser.avatar = {
              public_id: cloudinaryResponse.public_id,
              url: cloudinaryResponse.secure_url,
            };
            sessionUser.save();
            fs.unlink(file.filepath, () => {});
            return res.status(200).json({
              error: null,
              newAvatar: sessionUser.avatar,
            });
          } else if (
            !!sessionUser.avatar?.public_id &&
            !!sessionUser.avatar?.url
          ) {
            const { public_id } = sessionUser.avatar;
            sessionUser.avatar = { public_id: '', url: '' };
            Promise.all([
              cloudinary.uploader.destroy(public_id),
              sessionUser.save(),
            ]);
          }
          return res.status(200).json({
            error: null,
            newAvatar: sessionUser.avatar,
          });
        } catch (e) {
          if (e instanceof FormidableError) {
            res
              .status(e.httpCode || 400)
              .json({ error: e.message, newAvatar: null });
          } else {
            res
              .status(500)
              .json({ error: 'Internal Server Error', newAvatar: null });
          }
        }
      }
    );
  });
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
