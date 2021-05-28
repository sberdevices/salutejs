import { useCallback } from 'react';
import {
    createMatchers,
    createSaluteRequest,
    createSaluteResponse,
    createScenarioWalker,
    createSystemScenario,
    createUserScenario,
    NLPRequest,
    NLPResponse,
    SaluteHandler,
    SaluteRequest,
} from '@salutejs/scenario';
import { SaluteMemoryStorage } from '@salutejs/storage-adapter-memory';

import { useTransport } from './useTransport';

const addition: SaluteHandler<SaluteRequest> = ({ req, res }) => {
    const { tokenized_elements_list } = req.message;

    const result = tokenized_elements_list.reduce((acc, e, i) => {
        if (e.token_type !== 'NUM_TOKEN' || typeof e.token_value?.value !== 'number') {
            return acc;
        }

        return (
            acc +
            e.token_value.value *
                (i > 0 &&
                (tokenized_elements_list[i - 1].text === '-' || tokenized_elements_list[i - 1].text === 'минус')
                    ? -1
                    : 1)
        );
    }, 0);

    res.setPronounceText(`Результат ${result}`);
};

const { regexp } = createMatchers<SaluteRequest>();

const userScenario = createUserScenario({
    add: {
        match: regexp(/^сложить ((- |минус )?\d+) и ((- |минус )?\d+)$/i),
        handle: addition,
    },
});

const systemScenario = createSystemScenario({
    RUN_APP: ({ res }) => {
        res.setPronounceText('Дай любое задание');
        res.appendSuggestions(['сложи 5 и - 2']);
    },
});

const scenarioWalker = createScenarioWalker({
    systemScenario,
    userScenario,
});

const storage = new SaluteMemoryStorage();

export const useScenario = () => {
    const handleRequest = useCallback(async (request: NLPRequest): Promise<NLPResponse> => {
        const req = createSaluteRequest(request);
        const res = createSaluteResponse(request);

        const sessionId = request.uuid.userId;
        const session = await storage.resolve(sessionId);

        await scenarioWalker({ req, res, session });
        await storage.save({ id: sessionId, session });

        return res.message;
    }, []);

    useTransport(async (request, sendResponse) => {
        sendResponse(await handleRequest(request));
    });
};
