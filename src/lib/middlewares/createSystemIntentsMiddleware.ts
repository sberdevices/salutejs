import { SaluteMiddlewareCreator } from '../../types/salute';

export const createSystemIntentsMiddleware: SaluteMiddlewareCreator = ({ scenario }) => ({ req, res }) => {
    if (req.intent === 'run_app' || req.intent === 'close_app') {
        scenario.resolve(req.intent)({ req, res });
    }

    return Promise.resolve();
};
