import { SaluteRequest, ScenarioSchema } from './types/salute';

export function createUserScenario<R extends SaluteRequest = SaluteRequest>(scenarioSchema: ScenarioSchema) {
    /**
     * Возвращает вложенные обработчики для указанного пути в дереве диалогов
     * @param path путь в дереве диалога
     * @returns undefined или потомки
     */
    const getByPath = (path: string[]) => {
        let obj = scenarioSchema[path[0]];
        for (const p of path.slice(1)) {
            if (obj.children) {
                obj = obj.children[p];
            } else {
                return undefined;
            }
        }

        return obj;
    };

    /**
     * Возвращает обработчик запроса для указанного пути в дереве диалогов
     * @param path путь в дереве диалога, поиск будет выполнен среди вложенных обработчиков
     * @param req объект запроса
     * @returns Возвращает объект вида { path, state }, где state - обработчик, path - путь из дерева диалогов
     */
    const resolve = (path: string[], req: R) => {
        let matchedState: {
            path: string[];
            state: ScenarioSchema['string'];
        } | null = null;

        if (path.length > 0) {
            const state = getByPath(path);

            if (state?.children) {
                for (const el of Object.keys(state?.children)) {
                    const nextState = state?.children[el];
                    if (nextState.match(req)) {
                        matchedState = { state: nextState, path: [...path, el] };
                        break;
                    }
                }
            }
        }

        if (!matchedState) {
            for (const el of Object.keys(scenarioSchema)) {
                const nextState = scenarioSchema[el];
                if (nextState.match(req)) {
                    matchedState = { state: nextState, path: [el] };
                    break;
                }
            }
        }

        return matchedState;
    };

    return {
        getByPath,
        resolve,
    };
}
