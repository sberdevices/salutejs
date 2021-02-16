import { Intents, SaluteMiddleware, SaluteRequest, SaluteResponse, ServerActionIntent } from '../types/salute';

export const createServerActionIntentHandler = ({ intents }: { intents: Intents }): SaluteMiddleware => (
    req: SaluteRequest,
    res: SaluteResponse,
): Promise<void> => {
    if (req.intent === 'run_app') {
        intents.run_app.callback(req, res);
        return Promise.resolve();
    }

    if (req.intent === 'close_app') {
        intents.close_app?.callback(req, res);
        return Promise.resolve();
    }

    if (req.serverAction) {
        const intent = Object.values(intents).find(
            (i) => (i as ServerActionIntent).actionId === req.serverAction.action_id,
        );

        if (intent) {
            intent.callback(req, res);
        }
    }

    return Promise.resolve();
};
