import { SaluteMiddlewareCreator } from '../../types/salute';

export const createServerActionMiddleware: SaluteMiddlewareCreator = ({ scenario }) => async ({
    req,
    res,
    session,
}) => {
    if (req.serverAction) {
        const path = scenario.findActionPath(req.serverAction.type);
        const next = path ? scenario.resolve(...session.path, path) : undefined;

        if (next) {
            session.path.push(path);
            Object.keys(req.serverAction.payload || {}).forEach((key) => {
                req.setVariable(key, req.serverAction.payload[key]);
            });

            Object.keys(session.variables).forEach((name) => {
                req.setVariable(name, session.variables[name]);
            });

            const missingVars = scenario.getIntentMissingVariables(path, req.variables);
            if (missingVars.length) {
                missingVars.forEach(({ name }) => {
                    res.appendError({
                        code: 500,
                        description: `Missing required variable "${name}"`,
                    });
                });

                return;
            }

            // очищаем переменные сессии, не хотим их видеть в чилдах
            session.variables = {};

            await next.callback({
                req,
                res,
                session: session.state,
                history: {
                    get path() {
                        return session.path;
                    },
                    variables: session.variables,
                },
            });

            // сбрасываем сессию, если нет потомков
            if (!next.hasChildren) {
                session.path.splice(0, session.path.length);
                session.variables = {};
                session.state = {};
            }
        }
    }

    return Promise.resolve();
};
