import { createCycleScenarioMiddleware } from './lib/middlewares/createCycleScenarioMiddleware';
import { createSystemIntentsMiddleware } from './lib/middlewares/createSystemIntentsMiddleware';
import { createServerActionMiddleware } from './lib/middlewares/createServerActionMiddleware';
import { createDefaultAnswerMiddleware } from './lib/middlewares/createDefaultAnswerMiddleware';
import { createStringSimilarityRecognizerMiddleware } from './lib/middlewares/createStringSimilarityRecognizerMiddleware';
import { createScenarioWalker } from './lib/createScenarioWalker';
import { Scenario } from './lib/createScenario';
import { SaluteMemoryStorage, SaluteSessionStorage } from './lib/session';

export const createSaluteRequestHandler = (
    scenario: Scenario,
    params: {
        storage?: SaluteSessionStorage;
    } = {},
): ReturnType<typeof createScenarioWalker> =>
    createScenarioWalker({
        storage: params.storage || new SaluteMemoryStorage(),
        middlewares: [
            createSystemIntentsMiddleware({ scenario }),
            createServerActionMiddleware({ scenario }),
            createStringSimilarityRecognizerMiddleware({ scenario }),
            createCycleScenarioMiddleware({ scenario }),
            createDefaultAnswerMiddleware({ scenario }),
        ],
    });

export * from './types/salute';
export * from './lib/session';
export * from './lib/createScenario';
export * from './lib/createScenarioWalker';
