# @salutejs/scenario

Библиотека описания структры, матчинга и хендлеров пользовательского сценария.

> npm i -S @salutejs/scenario

## Словарь интентов и сущностей

Словарь описывается локально в файле с заданной схемой. В зависимости от типа рекогнайзера, словарь может синхронизроваться с удалённой моделью распознования.

`./src/intents.ts`
``` ts
import { createIntents } from '@salutejs/scenario';

export const intents = createIntents({
    openItem: {
        matchers: ['покажи', 'открой', 'открой номер'], // фразы, которые будут использованы для тренировки модели
    },
    slotFilling: {
        matchers: ['захвати яблок', 'захвати @number ялок'],
        variables: { // сущности, которые необходимо достать из фразы
            number: {
                required: true, // флаг обязательного присутствия сущности в сессии для продолжения сценария
                questions: ['Сколько яблок?', 'Сколько?'],
            },
        },
    },
});
```

## Пользовательский сценарий

``` ts
import { createUserScenario } from '@salutejs/scenario';

// ...

const userScenario = createUserScenario({
    OpenItemState: { // идентификатор состояния
          match: intent('OpenItem'),
          handle: ({ req, res }) => {
              const { number } = req.variables;

              res.appendCommand({ type: 'OpenItem', payload: selectItem({ number })(req) });
          },
    },
    slotFillingState: {
        match: intent('slotFilling'),
        handle: ({ res, req }) => res.setPronounceText(`Вы попросили ${req.variables.number} яблок`),
    },
});
```

## Матчеры

Хелперы декларативного описания условия выполнения хендела на поступивший запрос.

``` ts
import { createMatchers, createUserScenario, SaluteRequest } from '@salutejs/scenario';

import { intents } from './intents';

// NB: Указание типа запроса и словаря интентов добавляет интерактивный автокомплишен
const { match, intent, text, action, state, selectItem } = createMatchers<SaluteRequest, typeof intents>();
// Матчеры собираются в композицию функцией match

const userScenario = createUserScenario({
    state1: {
          match: match(intent('OpenItem'), state({ screen: 'main' }),
          handle: () => {},
    },
    state2: {
        match: text('да'), // распознование не будет передено в рекогнайзер
        handle: () => {},
    },
    state3: {
        match: action('LOAD_DATA'), // матчер на тип, передаваемый в server_action
        handle: () => {},
    },
});
```

## Системный сценарий

NLP-платформа обладает набором специальных интентов, которые указывают на жизненный цикл смартапа: `run_up`, `close_app`. Кроме них случаются ситуации, когда фраза пользователя не попала ни под один матчер состояния. Грубо говоря, мы не поняли что хотел сказать пользователь. Такие состояние описываются в отдельном обработчике системного сценария.

``` ts
import { createSystemScenario } from '@salutejs/scenario';

const systemScenario = createSystemScenario({
    RUN_APP: ({ res }) => { // реакция на запуск смартапа
        res.setPronounceText('Привет!');
    },
    CLOSE_UP: ({ res, session }) => { // реакция на закрытие смартапа
        db.save(session);
    },
    NO_MATCH: ({ res }) => { // реакция на не распознанную реплику
        res.setPronounceText('Я не понимаю');
    },
});
```

#### SberDevices with :heart:
