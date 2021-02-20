import { NLPRequestRA, NLPRequestSA } from '../../../types/request';
import { NLPResponseATU } from '../../../types/response';

import { scenarioWalker } from './app';
import Requests from './fixtures/todoRequests.json';
import Responses from './fixtures/todoResponses.json';

expect.extend({
    toBeEqualResponse(received: NLPResponseATU, expected: NLPResponseATU) {
        expect(expected.payload.pronounceText).toEqual(received.payload.pronounceText);
        expect(expected.payload.items).toEqual(received.payload.items);
        expect(expected.payload.suggestions).toEqual(received.payload.suggestions);
        return { pass: true, message: () => '' };
    },
});

describe('todo-app', () => {
    test('run_app', async () => {
        const res = await scenarioWalker(Requests.init as NLPRequestRA);
        expect(Responses.init).toBeEqualResponse(res as NLPResponseATU);
    });

    test('addNote', async () => {
        const res = await scenarioWalker(Requests.addNote as NLPRequestRA);
        expect(Responses.addNote).toBeEqualResponse(res as NLPResponseATU);
    });

    test('doneNote', async () => {
        const res = await scenarioWalker(Requests.doneNote as NLPRequestRA);
        expect(Responses.doneNote).toBeEqualResponse(res as NLPResponseATU);
    });

    test('doneNote action', async () => {
        const res = await scenarioWalker(Requests.doneNoteAction as NLPRequestSA);
        expect(Responses.doneNote).toBeEqualResponse(res as NLPResponseATU);
    });

    test('deleteNote', async () => {
        const res = await scenarioWalker(Requests.deleteNote as NLPRequestRA);
        expect(Responses.deleteNote).toBeEqualResponse(res as NLPResponseATU);
    });
});
