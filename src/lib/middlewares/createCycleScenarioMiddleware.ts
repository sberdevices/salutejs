import { Scenario, ScenarioIntentCallback } from '../createScenario';
import { Variant, SaluteMiddleware } from '../../types/salute';

/**
 * Ищет интент в узле дерева path, проходящий ограничение по minRating.
 * @param variants Распознанные интенты от классификатора
 * @param scenario Объект сценария
 * @param params Узел дерева и минимальный порог срабатывания интента
 * @returns Возвращает интент классификатора variant и его обработчик из сценария intent или undefined
 */
const resolveVariantAndIntent = (
    variants: Variant[],
    scenario: Scenario,
    { path, minRating }: { path: string[]; minRating: number },
): { callback: ScenarioIntentCallback; variant: Variant } | undefined =>
    variants.reduce((result: { callback: ScenarioIntentCallback; variant: Variant }, variant: Variant) => {
        if (result != null || variant.confidence < minRating) {
            return result;
        }

        const callback = scenario.resolve(...path, variant.intent.path);
        if (callback) {
            return { callback, variant };
        }

        return result;
    }, undefined);

///  > ── слотфиллинг? ──нет── вложенный интент? ──нет── глобальный интент? ──нет──┐
///            |                      |                      |                     |
///            да                     да                     да                    |
///            |                      |                      |                     |
///            └──────────────────────┤               Очистка сессии               |
///                                   ├──────────────────────┘                     |
///                          Заполнение переменных                                 |
///                     из сессии и слотов рекогнайзера                            |
///                                   |                                            |
///                        все переменные заполнены? ── нет ── Сохранение сессии ──┤
///                                   |                                            |
///                                   да                                           |
///                                   |                                            |
///                       Очистка переменных сессии                                |
///                                   |                                            |
///                              Вызов колбека                                     |
///                                   |                                            |
///                       Есть вложенные интенты? ─── нет ──── Очистка сессии ─────┤
///                                   |                                            |
///                                  да                                            ˅
///                                   └────────────────────────────────────────> выход

export const createCycleScenarioMiddleware = ({
    scenario,
    minRating = 0.7,
    slotFillingMinRating = 0,
}: {
    scenario: Scenario;
    minRating?: number;
    slotFillingMinRating?: number;
}): SaluteMiddleware => async ({ req, res, session }) => {
    // в variants должен быть хотя бы один интент, иначе нам делать ничего не нужно - выходим
    if (!req.inference?.variants.length) {
        return Promise.resolve();
    }

    // если есть история, резолвим предыдущий интент
    const previous = session.path.length ? scenario.resolve(...session.path) : null;
    let current: ScenarioIntentCallback = null; // здесь храним колбек интента, который будем исполнять
    let variant: Variant = null; // здесь храним результат распознавания для текущего интента

    // при слотфиллинге, устанавливаем предыдущий интент как текущий, если он есть в результатах распознавания
    if (previous && session.slotFilling) {
        // ищем предущий интент в результатах распознавания
        variant = (req.inference?.variants || []).find(
            (v) => v.confidence >= slotFillingMinRating && v.intent.path === session.path[session.path.length - 1],
        );
        current = variant ? previous : null;
        // заполненную переменную ожидаем увидеть в слотах интента
    }

    // резолвим вложенный интент (выход из слотфиллинга только для глобального интента)
    if (current == null && !session.slotFilling && session.path.length && previous.kind === 'children') {
        // ищем вложенный интент в текущем узле дерева интентов (session.path)
        const result = resolveVariantAndIntent(req.inference.variants, scenario, {
            path: session.path,
            minRating,
        });
        if (result != null) {
            current = result.callback;
            variant = result.variant;
        }
    }

    // резолвим глобальный интент
    if (current == null) {
        // ищем глобальный интент в корне сценария
        const result = resolveVariantAndIntent(req.inference.variants, scenario, { path: [], minRating });
        if (result != null) {
            // нашли глобальный интент - сбрасываем сессию, предыдущий интент нас не интересует
            session.variables = {};
            session.path = [];
            current = result.callback;
            variant = result.variant;
        }
    }

    // выходим, если интент неопределен
    if (current == null) {
        // пользователя оставляем на том же шаге сценария, сессию не сбрасываем
        return Promise.resolve();
    }

    // обновляем историю, при слотфиллинге обновление истории не требуется (текущий и предыдущий интенты идентичны)
    if (!session.path.length || current.path !== previous.path) {
        session.path.push(variant.intent.path);
    }

    // добавляем распознанные переменные
    variant.slots.forEach((slot) => {
        req.setVariable(slot.name, slot.value);
    });

    // добавляем значения из сессии (при дозапросе, значения хранятся в сессии)
    Object.keys(session.variables).forEach((name) => {
        req.setVariable(name, session.variables[name]);
    });

    // ищем незаполненные переменные, задаем вопрос пользователю
    const missingVars = scenario.getIntentMissingVariables(session.path[session.path.length - 1], req.variables);
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

        return Promise.resolve();
    }

    // все обязательные переменные заполнены, сбрасываем флаг слотфиллинга
    session.slotFilling = false;
    // очищаем переменные сессии, не хотим их видеть в чилдах
    session.variables = {};

    // вызываем обработчик интента
    await current.callback({
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
    if (!current.hasChildren) {
        session.path = [];
        session.variables = {};
        session.state = {};
    }

    return Promise.resolve();
};
