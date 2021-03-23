import { IntentsDict, SaluteRequest, SaluteResponse } from '../types/salute';

import { createUserScenario } from './createUserScenario';
import { SystemScenario } from './createSystemScenario';
import { lookupMissingVariables } from './missingVariables';
import { Recognizer } from './recognisers';
import { SaluteSession } from './session';

interface ScenarioWalkerOptions {
    intents: IntentsDict;
    recognizer: Recognizer;
    systemScenario: SystemScenario;
    userScenario: ReturnType<typeof createUserScenario>;
}

export const createScenarioWalker = ({
    intents,
    recognizer,
    systemScenario,
    userScenario,
}: ScenarioWalkerOptions) => async ({
    req,
    res,
    session,
}: {
    req: SaluteRequest;
    res: SaluteResponse;
    session: SaluteSession;
}) => {
    const dispatch = (path: string[]) => {
        const state = userScenario.getByPath(path);

        if (state) {
            session.path = path;
            req.currentState = {
                path: session.path,
                state,
            };
            state.handle({ req, res, session: session.state, history: {} }, dispatch);
        }
    };

    const saluteHandlerOpts = { req, res, session: session.state, history: {} };

    if (req.intent === 'run_app') {
        systemScenario.RUN_APP(saluteHandlerOpts, dispatch);
        return;
    }

    if (req.intent === 'close_app') {
        systemScenario.CLOSE_APP(saluteHandlerOpts, dispatch);
        return;
    }

    // INFERENCE LOGIC START
    await recognizer.inference({ req, res, session });

    Object.keys(session.variables).forEach((name) => {
        req.setVariable(name, session.variables[name]);
    });

    // TODO: make this more clever (confidence)
    // TODO2: make variant nullable FTW
    const variant = req.inference?.variants.length > 0 ? req.inference.variants[0] : null;

    if (variant) {
        variant.slots.forEach((slot) => {
            req.setVariable(slot.name, slot.value);
        });

        // SLOTFILING LOGIC START
        const slotFillingMinRating = 0;
        let currentIntent = variant;

        // при слотфиллинге, устанавливаем предыдущий интент как текущий, если он есть в результатах распознавания
        if (session.path.length && session.slotFilling) {
            // ищем предущий интент в результатах распознавания
            const connected = (req.inference?.variants || []).find(
                (v) =>
                    v.confidence >= slotFillingMinRating &&
                    v.intent.path === session.intents[session.intents.length - 1],
            );
            currentIntent = connected || variant;
        }

        // ищем незаполненные переменные, задаем вопрос пользователю
        const missingVars = lookupMissingVariables(currentIntent.intent.path, intents, req.variables);
        if (missingVars.length) {
            // сохраняем состояние в сессии
            Object.keys(req.variables).forEach((name) => {
                session.variables[name] = req.variables[name];
            });

            // задаем вопрос
            const { question } = missingVars[0];

            res.appendBubble(question);
            res.setPronounceText(question);

            // устанавливаем флаг слотфиллинга, на него будем смотреть при следующем запросе пользователя
            session.slotFilling = true;
            // сохранили интент со слотфилингом
            if (session.intents[session.intents.length - 1] !== currentIntent.intent.path) {
                session.intents.push(currentIntent.intent.path);
            }

            return;
        }
        // SLOTFILING LOGIC END
        // INFERENCE LOGIC END
    }

    const scenarioState = userScenario.resolve(session.path, req);

    if (scenarioState) {
        req.currentState = scenarioState;
        dispatch(scenarioState.path);

        if (!req.currentState.state.children) {
            session.path = [];
            session.variables = {};
            session.intents = [];
        } else {
            session.intents.push(variant.intent.path);
        }

        return;
    }

    systemScenario.NO_MATCH(saluteHandlerOpts, dispatch);
};
