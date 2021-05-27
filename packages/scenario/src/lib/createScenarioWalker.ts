import {
    IntentsDict,
    SaluteRequest,
    SaluteResponse,
    SaluteSession,
    Recognizer,
    SaluteRequestVariable,
    AppState,
} from '@salutejs/types';

import { createUserScenario } from './createUserScenario';
import { SystemScenario } from './createSystemScenario';
import { lookupMissingVariables } from './missingVariables';

interface ScenarioWalkerOptions {
    intents?: IntentsDict;
    recognizer?: Recognizer;
    systemScenario: SystemScenario;
    userScenario?: ReturnType<typeof createUserScenario>;
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
    req: SaluteRequest<SaluteRequestVariable, AppState, { action_id?: string; type: string; payload: unknown }>;
    res: SaluteResponse;
    session: SaluteSession;
}) => {
    const dispatch = async (path: string[]) => {
        if (!userScenario) return;

        const state = userScenario.getByPath(path);

        if (state) {
            session.path = path;
            req.currentState = {
                path: session.path,
                state,
            };

            if (req.variant && intents) {
                req.variant.slots.forEach((slot) => {
                    if (slot.array) {
                        if (typeof req.variables[slot.name] === 'undefined') {
                            req.setVariable(slot.name, []);
                        }

                        ((req.variables[slot.name] as unknown) as Array<string>).push(slot.value);
                        return;
                    }

                    req.setVariable(slot.name, slot.value);
                });

                // SLOTFILING LOGIC START
                let currentIntent = req.variant;

                if (session.path.length && session.slotFilling) {
                    // ищем связь с текущим интентом в сессии и результатах распознавания
                    const connected = (req.inference?.variants || []).find(
                        (v) => v.confidence >= slotFillingConfidence && v.intent.path === session.currentIntent,
                    );
                    currentIntent = connected || req.variant;
                }

                const currentIntentPath = currentIntent.intent.path;
                session.currentIntent = currentIntentPath;

                // ищем незаполненные переменные, задаем вопрос пользователю
                const missingVars = lookupMissingVariables(currentIntentPath, intents, req.variables);
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

                    return;
                }
                // SLOTFILING LOGIC END
            }

            await state.handle({ req, res, session: session.state, history: {} }, dispatch);
        }
    };

    const saluteHandlerOpts = { req, res, session: session.state, history: {} };

    if (req.systemIntent === 'run_app') {
        if (req.serverAction?.action_id === 'PAY_DIALOG_FINISHED') {
            if (typeof systemScenario.PAY_DIALOG_FINISHED === 'undefined') {
                res.appendError({
                    code: 404,
                    description: 'Missing handler for action: "PAY_DIALOG_FINISHED"',
                });
                return;
            }

            systemScenario.PAY_DIALOG_FINISHED(saluteHandlerOpts, dispatch);
            return;
        }

        systemScenario.RUN_APP(saluteHandlerOpts, dispatch);
        return;
    }

    if (req.systemIntent === 'close_app') {
        systemScenario.CLOSE_APP(saluteHandlerOpts, dispatch);
        return;
    }

    // restore request from session
    Object.keys(session.variables).forEach((name) => {
        req.setVariable(name, session.variables[name]);
    });

    if (typeof intents !== undefined && userScenario) {
        // restore request from server_action payload
        if (req.serverAction) {
            Object.keys((req.serverAction.payload || {}) as Record<string, unknown>).forEach((key) => {
                req.setVariable(key, (req.serverAction?.payload as Record<string, unknown>)[key]);
            });
        }

        if (req.voiceAction && typeof recognizer !== 'undefined') {
            await recognizer.inference({ req, res, session });
        }

        const scenarioState = userScenario.resolve(session.path, req);

        if (req.serverAction && typeof intents !== 'undefined') {
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
            await dispatch(scenarioState.path);

            if (!req.currentState.state.children) {
                session.path = [];
                session.variables = {};
                session.currentIntent = undefined;
            }

            return;
        }
    }

    systemScenario.NO_MATCH(saluteHandlerOpts, dispatch);
};
