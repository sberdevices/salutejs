import { NextApiRequest, NextApiResponse } from 'next';
import {
    createIntents,
    createUserScenario,
    createSystemScenario,
    createSaluteRequest,
    createSaluteResponse,
    createScenarioWalker,
} from '@salutejs/scenario';
import { SaluteMemoryStorage } from '@salutejs/memory';

const scenarioWalker = createScenarioWalker({
    intents: createIntents({}),
    systemScenario: createSystemScenario({}),
    userScenario: createUserScenario({}),
});

const storage = new SaluteMemoryStorage();

export default async (request: NextApiRequest, response: NextApiResponse) => {
    const req = createSaluteRequest(request.body);
    const res = createSaluteResponse(request.body);

    const sessionId = request.body.uuid.userId;
    const session = await storage.resolve(sessionId);

    await scenarioWalker({ req, res, session });
    await storage.save({ id: sessionId, session });

    response.status(200).json(res.message);
};
