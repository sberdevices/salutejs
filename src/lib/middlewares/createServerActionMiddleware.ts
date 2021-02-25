import { SaluteMiddlewareCreator } from '../../types/salute';

export const createServerActionMiddleware: SaluteMiddlewareCreator = ({ scenario }) => async ({
    req,
    res,
    session,
}) => {
    if (req.serverAction) {
        const path = scenario.findActionPath(req.serverAction.action_id);
        const next = path ? scenario.resolve(...session.path, path) : undefined;

        if (next) {
            session.path.push(path);
            Object.keys(req.serverAction.parameters).forEach((key) => {
                req.setVariable(key, req.serverAction.parameters[key]);
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

            await next.callback({ req, res, session });

            // сбрасываем сессию, если нет потомков
            if (!next.hasChildren) {
                session.path.splice(0, session.path.length);
                session.variables = {};
            }
        }
    }

    return Promise.resolve();
};
