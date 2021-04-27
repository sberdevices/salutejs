# @salutejs/recognizer-smartapp-brain

SmartApp Brain — технология определения смысла фразы (намерения) пользователя. Позволяет создавать классификаторы из необработанных логов и управлять обучающими выборками. Включает готовые к использованию machine learning модели. Технология используется классификатором [SmartApp Code](https://developer.sberdevices.ru/docs/ru/developer_tools/ide/smartappcode_description_and_guide) и [SmartApp Graph](https://developer.sberdevices.ru/docs/ru/developer_tools/flow/quick_start/quick_start). Под капотом обращается к SmartApp Brain Direct API.

> npm i -S @salutejs/recognizer-smartapp-brain

## Usage

### Access token

1. Создать проект в https://smartapp-code.sberdevices.ru
2. Перейти в проект
3. Настройки проекта -> Классификатор -> __API-ключ Brain__

### Получение интентов

> brain pull -t <access_token>

Словарь с интентами по умолчанию будет записан в `./src/intents.json`. Чтобы изменить расположение файла воспользуйтесь параметром `-p`.

### Обновление интентов

Словарь интентов редактируется локально и после редактирования должен быть загружен в SmartApp Brain.

> brain push -t <access_token>

### Подключение интентов в коде

``` ts
import { createIntents, createScenarioWalker } from '@salutejs/scenario';
import { SmartAppBrainRecognizer } from '@salutejs/recognizer-smartapp-brain';

import intentsDict from './intents.json';

const intents = createIntents(intentsDict);

const scenarioWalker = createScenarioWalker({
    // ...
    intents,
    recognizer: new SmartAppBrainRecognizer(process.env.SMARTAPP_BRAIN_TOKEN),
    // ...
});
```


#### SberDevices with :heart:
