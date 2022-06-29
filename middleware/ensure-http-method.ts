import type { NextApiRequest, NextApiResponse } from 'next';

type AllowedMethods = 'POST' | 'PUT' | 'GET' | 'DELETE';

function ensureHttpMethod(
  req: NextApiRequest,
  res: NextApiResponse,
  method: AllowedMethods | AllowedMethods[],
  cb: (req: NextApiRequest, res: NextApiResponse) => any
) {
  if (method.includes(req.method as AllowedMethods)) return cb(req, res);
  return res.status(400).json({
    errorMessage: `This route only accepts ${
      typeof method === 'object' ? method.join(' or ') : method
    } requests, the current is a ${req.method}`,
  });
}

export default ensureHttpMethod;
