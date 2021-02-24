import { SaluteMiddlewareCreator } from '../../types/salute';

export const createSystemIntentsMiddleware: SaluteMiddlewareCreator = ({ scenario }) => async ({
    req,
    res,
    session,
}) => {
    if (req.intent === 'run_app' || req.intent === 'close_app') {
        return scenario.ask(req.intent, { req, res, session });
    }

    return Promise.resolve();
};
