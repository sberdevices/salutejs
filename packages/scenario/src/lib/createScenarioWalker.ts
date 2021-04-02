import { IntentsDict, SaluteRequest, SaluteResponse, SaluteSession, Recognizer } from '@salutejs/types';

import { createUserScenario } from './createUserScenario';
import { SystemScenario } from './createSystemScenario';
import { lookupMissingVariables } from './missingVariables';

interface ScenarioWalkerOptions {
    intents: IntentsDict;
    recognizer?: Recognizer;
    systemScenario: SystemScenario;
    userScenario: ReturnType<typeof createUserScenario>;
    slotFillingConfidence?: number;
}

export const createScenarioWalker = ({
    intents,
    recognizer,
    systemScenario,
    userScenario,
    slotFillingConfidence = 0,
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

    // restore request from session
    Object.keys(session.variables).forEach((name) => {
        req.setVariable(name, session.variables[name]);
    });

    // restore request from server_action payload
    if (req.serverAction) {
        Object.keys(req.serverAction.payload || {}).forEach((key) => {
            req.setVariable(key, req.serverAction.payload[key]);
        });
    }

    if (req.voiceAction && typeof recognizer !== 'undefined') {
        // INFERENCE LOGIC START
        await recognizer.inference({ req, res, session });

        // TODO: make this more clever (confidence)
        // TODO2: make variant nullable FTW
        const variant = req.inference?.variants.length > 0 ? req.inference.variants[0] : null;

        if (variant) {
            variant.slots.forEach((slot) => {
                req.setVariable(slot.name, slot.value);
            });

            // SLOTFILING LOGIC START
            let currentIntent = variant;

            if (session.path.length && session.slotFilling) {
                // ищем связь с текущим интентом в сессии и результатах распознавания
                const connected = (req.inference?.variants || []).find(
                    (v) => v.confidence >= slotFillingConfidence && v.intent.path === session.currentIntent,
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

                session.currentIntent = currentIntent.intent.path;

                return;
            }
            // SLOTFILING LOGIC END

            session.currentIntent = currentIntent.intent.path;
            // INFERENCE LOGIC END
        }
    }

    const scenarioState = userScenario.resolve(session.path, req);

    if (req.serverAction) {
        if (!scenarioState) {
            res.appendError({
                code: 404,
                description: `Missing handler for action: "${req.serverAction.type}"`,
            });

            return;
        }

        const missingVars = lookupMissingVariables(req.serverAction.type, intents, req.variables);
        if (missingVars.length) {
            res.appendError({
                code: 500,
                description: `Missing required variables: ${missingVars.map(({ name }) => `"${name}"`).join(', ')}`,
            });

            return;
        }
    }

    if (scenarioState) {
        req.currentState = scenarioState;
        dispatch(scenarioState.path);

        if (!req.currentState.state.children) {
            session.path = [];
            session.variables = {};
            session.currentIntent = undefined;
        }

        return;
    }

    systemScenario.NO_MATCH(saluteHandlerOpts, dispatch);
};
