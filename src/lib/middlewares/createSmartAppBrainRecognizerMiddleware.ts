import { SaluteMiddlewareCreator } from '../../types/salute';
import { SmartAppBrainRecognizer } from '../recognisers/smartAppBrain';

export const createSmartAppBrainRecognizerMiddleware: SaluteMiddlewareCreator = () => {
    const recognizer = new SmartAppBrainRecognizer('7aadb15c-11cc-461a-8da6-94b3ae6884a2');

    return recognizer.inference;
};
