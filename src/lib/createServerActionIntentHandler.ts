import { SaluteMiddlewareCreator, SaluteRequest, SaluteResponse, ServerActionIntent } from '../types/salute';

export const createServerActionIntentHandler: SaluteMiddlewareCreator = ({ scenario }) => (
    req: SaluteRequest,
    res: SaluteResponse,
): Promise<void> => {
    if (req.intent === 'run_app' || req.intent === 'close_app') {
        scenario.resolve(req.intent)({ req, res });
        return Promise.resolve();
    }

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
