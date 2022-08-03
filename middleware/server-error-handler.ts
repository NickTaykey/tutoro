import type { NextApiRequest, NextApiResponse } from 'next';

function onError(err: unknown, req: NextApiRequest, res: NextApiResponse) {
  const errObject = err as Record<string, string>;
  console.error(errObject.stack);
  res.status(500).json({
    errorMessage: 'Unexpected server side error, please contact us.',
    errorStack: errObject.stack,
  });
}

export default onError;
