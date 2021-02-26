import { NLPResponseATU } from '../../types/response';
import { SaluteMiddlewareCreator } from '../../types/salute';

export const createDefaultAnswerMiddleware: SaluteMiddlewareCreator = ({ scenario }) => async ({
    req,
    res,
    session,
}) => {
    const answer = res.message as NLPResponseATU;
    if (
        !answer.payload.items?.length &&
        answer.payload.pronounceText == null &&
        !answer.payload.suggestions?.buttons?.length
    ) {
        return scenario.ask('failure', { req, res, session });
    }

    return Promise.resolve();
};
