import { SaluteMiddlewareCreator } from '../../types/salute';

export const createServerActionMiddleware: SaluteMiddlewareCreator = ({ scenario }) => async ({
    req,
    res,
    session,
}) => {
    if (req.serverAction) {
        const intent = Object.keys(scenario.intents).find(
            (i) => scenario.intents[i].actionId === req.serverAction.action_id,
        );

        if (intent) {
            return scenario.ask(intent, { req, res, session });
        }
    }

    return Promise.resolve();
};
