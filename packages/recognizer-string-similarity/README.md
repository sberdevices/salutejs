# @salutejs/recognizer-string-similarity

Набор стандартных рекогнайзеров для распознования реплик пользователей.

> npm i -S @salutejs/recognizer-string-similarity

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

#### SberDevices with :heart:
