import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  name: string;
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ 
    name: 'Gifty API', 
    message: 'API is working correctly!' 
  });
} 