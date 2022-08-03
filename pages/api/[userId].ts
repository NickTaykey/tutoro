import { parseForm, FormidableError } from '../../utils/parse-form';
import onError from '../../middleware/server-error-handler';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

import type { NextApiResponse } from 'next';
import type { ExtendedRequest } from '../../types';
import type { UploadApiResponse } from 'cloudinary';
import type { File, Part } from 'formidable';

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

import { createRouter } from 'next-connect';
import requireAuth from '../../middleware/require-auth';

const router = createRouter<ExtendedRequest, NextApiResponse>();

router.put(
  requireAuth('You have to be authenticated to update your avatar'),
  async (req, res) => {
    try {
      const { files } = await parseForm(req, avatarUploadConfig);
      const file = files.avatar as File;
      if (file) {
        if (
          !!req.sessionUser.avatar?.public_id &&
          !!req.sessionUser.avatar?.url
        ) {
          cloudinary.uploader.destroy(req.sessionUser.avatar.public_id);
        }
        const cloudinaryResponse: UploadApiResponse =
          await cloudinary.uploader.upload(file.filepath, {
            folder: 'tutoro/avatars/',
          });
        req.sessionUser.avatar = {
          public_id: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        };
        req.sessionUser.save();
        fs.unlink(file.filepath, () => {});
        return res.status(200).json({
          error: null,
          newAvatar: req.sessionUser.avatar,
        });
      } else if (
        !!req.sessionUser.avatar?.public_id &&
        !!req.sessionUser.avatar?.url
      ) {
        const { public_id } = req.sessionUser.avatar;
        req.sessionUser.avatar = { public_id: '', url: '' };
        Promise.all([
          cloudinary.uploader.destroy(public_id),
          req.sessionUser.save(),
        ]);
      }
      return res.status(200).json({
        error: null,
        newAvatar: req.sessionUser.avatar,
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

export default router.handler({
  onError,
});

export const config = {
  api: {
    bodyParser: false,
  },
};
