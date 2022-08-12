import onError from '../../middleware/server-error-handler';
import cloudinary from '../../utils/cloudinary-config';

import type { ExtendedRequest } from '../../utils/types';
import type { NextApiResponse } from 'next';

import requireAuth from '../../middleware/require-auth';
import { createRouter } from 'next-connect';

const router = createRouter<ExtendedRequest, NextApiResponse>();

router.put(
  requireAuth('You have to be authenticated to update your avatar'),
  async (req, res) => {
    try {
      const { public_id, url } = req.body;

      if (public_id && url) {
        if (
          !!req.sessionUser.avatar?.public_id &&
          !!req.sessionUser.avatar?.url
        ) {
          cloudinary.uploader.destroy(req.sessionUser.avatar.public_id);
        }

        req.sessionUser.avatar = {
          public_id,
          url,
        };
        req.sessionUser.save();

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
      return res
        .status(500)
        .json({ error: 'Internal Server Error', newAvatar: null });
    }
  }
);

export default router.handler({
  onError,
});
