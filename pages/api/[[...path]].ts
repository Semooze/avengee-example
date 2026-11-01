import type { NextApiRequest, NextApiResponse } from 'next';
import { handleRequest } from '@avengee/api';
export const config = { api: { bodyParser: false, externalResolver: true } };
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return handleRequest(
    req as unknown as Parameters<typeof handleRequest>[0],
    res as unknown as Parameters<typeof handleRequest>[1],
  );
}
