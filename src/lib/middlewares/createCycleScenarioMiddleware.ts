import { Scenario, ScenarioIntent, ScenarioObject } from '../createScenario';
import { Variant, SaluteMiddleware, Inference } from '../../types/salute';

const resolveVariantAndIntent = (
    inference: Inference,
    scenario: Scenario,
    { path, minRating }: { path?: string[]; minRating: number },
): { intent: ScenarioIntent; variant: Variant } | undefined =>
    inference.variants.reduce((result: { intent: ScenarioIntent; variant: Variant }, variant: Variant) => {
        if (result != null || variant.confidence < minRating) {
            return result;
        }

        const intent = scenario.resolve(...(path || []), variant.intent.path);
        if (intent) {
            return { intent, variant };
        }

        return result;
    }, undefined);

export const createCycleScenarioMiddleware = ({
    scenario,
    minRating = 0.7,
}: {
    scenario: Scenario;
    minRating?: number;
}): SaluteMiddleware => async ({ req, res, session }) => {
    let next: ScenarioIntent = null;
    let variant: Variant = null;

    if (!req.inference?.variants.length) {
        return Promise.resolve();
    }

    const current = scenario.resolve(...session.path);
    // здесь нужен детект дозапроса данных

    // резолвим вложенный интент
    if (session.path.length && current != null && current.kind === 'children') {
        const result = resolveVariantAndIntent(req.inference, scenario, {
            path: session.path,
            minRating,
        });
        if (result != null) {
            next = result.intent;
            variant = result.variant;
        }
    }

    // резолвим глобальный интент, если с вложенным не получилось
    if (next == null) {
        session.variables = {};
        session.path.splice(0, session.path.length);
        const result = resolveVariantAndIntent(req.inference, scenario, { minRating });
        if (result != null) {
            next = result.intent;
            variant = result.variant;
        }
    }

    // выходим, если интент неопределен
    if (next == null) {
        return Promise.resolve();
    }

    req.setVariant(variant);
    session.path.push(req.variant.intent.path);

    req.variant.slots.forEach((slot) => {
        req.setVariable(slot.name, slot.value);
    });

    Object.keys(session.variables).forEach((name) => {
        req.setVariable(name, session.variables[name]);
    });

    await next.callback({ req, res, session });

    // сбрасываем сессию, если нет потомков
    if (!next.hasChildren) {
        session.path.splice(0, session.path.length);
        session.variables = {};
    }

    return Promise.resolve();
};
