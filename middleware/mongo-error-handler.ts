import { Error } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';

async function mongoErrorHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  modelName: string,
  cb: () => Promise<any>
): Promise<any> {
  try {
    await cb();
  } catch (e) {
    if (e instanceof Error.CastError) {
      return res.status(400).json({
        errorMessage:
          e.kind === 'Number'
            ? 'Invalid star rating value was passed, it has to be a number.'
            : `Invalid ${modelName} id provided!`,
      });
    } else if (e instanceof Error.ValidationError) {
      if (e.errors && e.errors.stars) {
        const { kind, message } = e.errors.stars;
        if (kind === 'Number' || kind === 'min' || kind === 'max')
          return res.status(400).json({
            errorMessage:
              kind === 'Number'
                ? 'star rating was passed, it has to be a number.'
                : message,
          });
      }
    } else throw new Error(JSON.stringify(e));
  }
}

export default mongoErrorHandler;
