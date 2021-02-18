import { SaluteMiddlewareCreator } from '../../types/salute';

export const createServerActionMiddleware: SaluteMiddlewareCreator = ({ scenario }) => ({ req, res }) => {
    if (req.serverAction) {
        const intent = Object.keys(scenario.intents).find(
            (i) => scenario.intents[i].actionId === req.serverAction.action_id,
        );

        if (intent) {
            scenario.resolve(intent)({ req, res });
        }
    }

    return Promise.resolve();
};
