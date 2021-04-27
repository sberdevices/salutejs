import {
    createUserScenario,
    createSystemScenario,
    createSaluteRequest,
    createSaluteResponse,
    createScenarioWalker,
    createMatchers,
    SaluteRequest,
    NLPRequest,
    NLPResponse,
} from '@salutejs/scenario';
import { SaluteMemoryStorage } from '@salutejs/storage-adapter-memory';

import {
    addNote,
    deleteNote,
    deleteNoteApproved,
    deleteNoteCancelled,
    doneNote,
    noMatchHandler,
    runAppHandler,
} from './handlers';

const { action, regexp } = createMatchers<SaluteRequest>();

const userScenario = createUserScenario({
    AddNote: {
        match: regexp(/^(запиши|напомни|добавь запись) (?<note>.+)$/i),
        handle: addNote,
    },
    DoneNote: {
        match: regexp(/^(выполнила?|сделала?) (?<note>.+)$/i),
        handle: doneNote,
    },
    DoneNoteAction: {
        match: action('done'),
        handle: doneNote,
    },
    DeleteNote: {
        match: regexp(/^(удалить|удали) (?<note>.+)$/i),
        handle: deleteNote,
        children: {
            yes: {
                match: regexp(/^(да|продолжить)$/i),
                handle: deleteNoteApproved,
            },
            no: {
                match: regexp(/^(нет|отменить)$/i),
                handle: deleteNoteCancelled,
            },
        },
    },
});

const scenarioWalker = createScenarioWalker({
    systemScenario: createSystemScenario({
        RUN_APP: runAppHandler,
        NO_MATCH: noMatchHandler,
    }),
    userScenario,
});

const storage = new SaluteMemoryStorage();

export const handleNlpRequest = async (request: NLPRequest): Promise<NLPResponse> => {
    const req = createSaluteRequest(request);
    const res = createSaluteResponse(request);

    const sessionId = request.uuid.userId;
    const session = await storage.resolve(sessionId);

    await scenarioWalker({ req, res, session });
    await storage.save({ id: sessionId, session });

    return res.message;
};
