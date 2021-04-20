# @salutejs/recognizer-smartapp-brain

Набор стандартных рекогнайзеров для распознования реплик пользователей.

> npm i -S @salutejs/recognizer-smartapp-brain

## SmartApp Brain

SmartApp Brain — технология определения смысла фразы (намерения) пользователя. Позволяет создавать классификаторы из необработанных логов и управлять обучающими выборками. Включает готовые к использованию machine learning модели. Технология используется классификатором [SmartApp Code](https://developer.sberdevices.ru/docs/ru/developer_tools/ide/smartappcode_description_and_guide) и [SmartApp Graph](https://developer.sberdevices.ru/docs/ru/developer_tools/flow/quick_start/quick_start). Под капотом обращается к SmartApp Brain Direct API.

``` ts
import { createScenarioWalker } from '@salutejs/scenario';
import { SmartAppBrainRecognizer } from '@salutejs/recognizer-smartapp-brain';

const scenarioWalker = createScenarioWalker({
    // ...
    recognizer: new SmartAppBrainRecognizer(process.env.ACCESS_TOKEN),
    // ...
});
```

#### SberDevices with :heart:
