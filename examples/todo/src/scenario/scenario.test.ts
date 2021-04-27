import { NLPRequestRA, NLPRequestSA, NLPResponseATU } from '@salutejs/scenario';

import Requests from '../../fixtures/requests.json';
import Responses from '../../fixtures/responses.json';

import { handleNlpRequest } from './scenario';

expect.extend({
    toBeEqualResponse(received: NLPResponseATU, expected: NLPResponseATU) {
        expect(expected.payload.pronounceText).toEqual(received.payload.pronounceText);
        expect(expected.payload.items).toEqual(received.payload.items);
        expect(expected.payload.suggestions).toEqual(received.payload.suggestions);
        return { pass: true, message: () => '' };
    },
});

describe('todo-scenario', () => {
    test('run_app', async () => {
        const res = await handleNlpRequest(Requests.init as NLPRequestRA);
        expect(Responses.init).toBeEqualResponse(res as NLPResponseATU);
    });

    test('addNote', async () => {
        const res = await handleNlpRequest(Requests.addNote as NLPRequestRA);
        expect(Responses.addNote).toBeEqualResponse(res as NLPResponseATU);
    });

    test('doneNote', async () => {
        const res = await handleNlpRequest(Requests.doneNote as NLPRequestRA);
        expect(Responses.doneNote).toBeEqualResponse(res as NLPResponseATU);
    });

    test('doneNote action', async () => {
        const res = await handleNlpRequest(Requests.doneNoteAction as NLPRequestSA);
        expect(Responses.doneNote).toBeEqualResponse(res as NLPResponseATU);
    });

    test('deleteNote continue', async () => {
        const res1 = await handleNlpRequest(Requests.deleteNote as NLPRequestRA);
        const res2 = await handleNlpRequest(Requests.deleteNoteContinue as NLPRequestRA);
        expect(Responses.deleteNote).toBeEqualResponse(res1 as NLPResponseATU);
        expect(Responses.deleteNoteContinue).toBeEqualResponse(res2 as NLPResponseATU);
    });

    test('deleteNote cancel', async () => {
        const res1 = await handleNlpRequest(Requests.deleteNote as NLPRequestRA);
        const res2 = await handleNlpRequest(Requests.deleteNoteCancel as NLPRequestRA);
        expect(Responses.deleteNote).toBeEqualResponse(res1 as NLPResponseATU);
        expect(Responses.deleteNoteCancel).toBeEqualResponse(res2 as NLPResponseATU);
    });

    test('deleteNote skip', async () => {
        const res1 = await handleNlpRequest(Requests.deleteNote as NLPRequestRA);
        const res2 = await handleNlpRequest(Requests.addNote as NLPRequestRA);
        expect(Responses.deleteNote).toBeEqualResponse(res1 as NLPResponseATU);
        expect(Responses.addNote).toBeEqualResponse(res2 as NLPResponseATU);
    });

    test('default intent', async () => {
        const res = await handleNlpRequest(Requests.default as NLPRequestRA);
        expect(Responses.default).toBeEqualResponse(res as NLPResponseATU);
    });
});
