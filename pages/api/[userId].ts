import type { NextApiRequest, NextApiResponse } from 'next';
import { parseForm, FormidableError } from '../../utils/parse-form';
import { v2 as cloudinary } from 'cloudinary';
import requireAuth from '../../middleware/require-auth';
import ensureHttpMethod from '../../middleware/ensure-http-method';
import fs, { PathLike } from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{
    newAvatarUrl: string | null;
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
          const { files } = await parseForm(req);
          const file = files.avatar;
          if (file) {
            let url = Array.isArray(file)
              ? file.map(f => f.filepath)
              : file.filepath;
            if (!!sessionUser.avatar?.public_id && !!sessionUser.avatar?.url) {
              cloudinary.uploader.destroy(sessionUser.avatar.public_id);
            }
            const cloudinaryResponse = await cloudinary.uploader.upload(
              url as string,
              {
                folder: 'tutoro-images/',
              }
            );
            sessionUser.avatar = {
              public_id: cloudinaryResponse.public_id,
              url: cloudinaryResponse.secure_url,
            };
            sessionUser.save();
            fs.unlink(url as PathLike, () => {});
            return res.status(200).json({
              error: null,
              newAvatarUrl: cloudinaryResponse.secure_url,
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
            newAvatarUrl: null,
          });
        } catch (e) {
          if (e instanceof FormidableError) {
            res
              .status(e.httpCode || 400)
              .json({ error: e.message, newAvatarUrl: null });
          } else {
            res
              .status(500)
              .json({ error: 'Internal Server Error', newAvatarUrl: null });
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
