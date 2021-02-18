import { NLPResponseATU } from '../../types/response';
import { SaluteMiddlewareCreator } from '../../types/salute';

export const createDefaultAnswerMiddleware: SaluteMiddlewareCreator = ({ scenario }) => ({ req, res }) => {
    const answer = res.message as NLPResponseATU;
    if (
        !answer.payload.items?.length &&
        answer.payload.pronounceText == null &&
        !answer.payload.suggestions?.buttons?.length
    ) {
        scenario.resolve('default')({ req, res });
    }

    return Promise.resolve();
};
