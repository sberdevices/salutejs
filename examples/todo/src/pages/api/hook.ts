import { NextApiRequest, NextApiResponse } from 'next';

import { handleNlpRequest } from '../../scenario/scenario';

export default async (request: NextApiRequest, response: NextApiResponse) => {
    response.status(200).json(await handleNlpRequest(request.body));
};
