import { SaluteMiddlewareCreator } from '../../types/salute';
import { StringSimilarityRecognizer } from '../recognisers/stringSimilarity';

export const createStringSimilarityRecognizerMiddleware: SaluteMiddlewareCreator = ({ scenario }) => {
    const recognizer = new StringSimilarityRecognizer({ scenario });

    return recognizer.inference;
};
