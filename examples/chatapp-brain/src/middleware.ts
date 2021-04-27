import { createScenarioWalker, createSaluteRequest, createSaluteResponse } from '@salutejs/scenario';

export const saluteExpressMiddleware = ({ intents, recognizer, userScenario, systemScenario, storage }) => {
    const scenarioWalker = createScenarioWalker({ intents, recognizer, systemScenario, userScenario });

    return async ({ body }, httpRes) => {
        const req = createSaluteRequest(body);
        const res = createSaluteResponse(body);
        const id = body.uuid.userId;
        const session = await storage.resolve(id);

        await scenarioWalker({ req, res, session });
        await storage.save({ id, session });

        httpRes.json(res.message);
    };
};
