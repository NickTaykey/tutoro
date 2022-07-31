import type { NextApiRequest } from 'next';
import mime from 'mime';
import { join } from 'path';
import formidable from 'formidable';
import { mkdir, stat } from 'fs/promises';
import sanitize from '../middleware/mongo-sanitize';

export const FormidableError = formidable.errors.FormidableError;

interface FormidableConfig {
  maxFiles: number;
  dir: string;
  multiple: boolean;
  filter: (part: formidable.Part) => boolean;
}

export const parseForm = async (
  req: NextApiRequest,
  formidableConfig: FormidableConfig
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return await new Promise(async (resolve, reject) => {
    const uploadDir = join(
      process.env.ROOT_DIR || process.cwd(),
      `/uploads/${formidableConfig.dir}`
    );

    try {
      await stat(uploadDir);
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        await mkdir(uploadDir, { recursive: true });
      } else {
        reject(e);
        return;
      }
    }

    let filename = '';
    const form = formidable({
      maxFiles: formidableConfig.maxFiles,
      multiples: formidableConfig.multiple,
      maxFileSize: 1024 * 1024 * 10, // 10mb
      uploadDir,
      filename: (_name, _ext, part) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        filename = `${part.name || 'unknown'}-${
          _name ? _name : ''
        }-${uniqueSuffix}.${
          mime.getExtension(part.mimetype || '') || 'unknown'
        }`;
        return filename;
      },
      filter: formidableConfig.filter,
    });

    form.parse(req, function (err, fields, files) {
      if (err) reject(err);
      else resolve({ fields: sanitize(fields), files });
    });
  });
};
