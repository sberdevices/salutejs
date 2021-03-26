# @salutejs/recognizer

Набор стандартных рекогнайзеров для распознования реплик пользователей.

> npm i -S @salutejs/recognizer

## String Similarity

Рекогнайзер, основанный на вычисленнии схожести реплик. Схожесть вычисляется посредством [коэффициента Сёренсена](https://ru.wikipedia.org/wiki/%D0%9A%D0%BE%D1%8D%D1%84%D1%84%D0%B8%D1%86%D0%B8%D0%B5%D0%BD%D1%82_%D0%A1%D1%91%D1%80%D0%B5%D0%BD%D1%81%D0%B5%D0%BD%D0%B0). Под капотом используется пакет [string-similariy](https://github.com/aceakash/string-similarity) — реализация алгоритма на JS.

``` ts
import { createScenarioWalker } from '@salutejs/scenario';
import { StringSimilarityRecognizer } from '@salutejs/recognizer';

import { intents } from './intents';

const scenarioWalker = createScenarioWalker({
    // ...
    recognizer: new StringSimilarityRecognizer({ intents }),
    // ...
});
```

## SmartApp Brain

SmartApp Brain — технология определения смысла фразы (намерения) пользователя. Позволяет создавать классификаторы из необработанных логов и управлять обучающими выборками. Включает готовые к использованию machine learning модели. Технология используется классификатором [SmartApp Code](https://developer.sberdevices.ru/docs/ru/developer_tools/ide/smartappcode_description_and_guide) и [SmartApp Graph](https://developer.sberdevices.ru/docs/ru/developer_tools/flow/quick_start/quick_start). Под капотом обращается к SmartApp Brain Direct API.

``` ts
import { createScenarioWalker } from '@salutejs/scenario';
import { SmartAppBrainRecognizer } from '@salutejs/recognizer';

const scenarioWalker = createScenarioWalker({
    // ...
    recognizer: new SmartAppBrainRecognizer(process.env.ACCESS_TOKEN, process.env.SMARTAPP_BRAIN_HOST),
    // ...
});
```

#### SberDevices with :heart:
