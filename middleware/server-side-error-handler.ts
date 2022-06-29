import type { NextApiRequest, NextApiResponse } from 'next';

async function serverSideErrorHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  cb: (req: NextApiRequest, res: NextApiResponse) => any
) {
  try {
    await cb(req, res);
  } catch (e) {
    res.status(500).json({
      errorMessage: 'Unexpected internal server error',
      error: JSON.stringify(e),
    });
  }
}

export default serverSideErrorHandler;
