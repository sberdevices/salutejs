![salutejs](https://user-images.githubusercontent.com/982072/112627725-0606e400-8e43-11eb-86ef-a9e2fdcfc465.png)

# SaluteJS

__Set of minimalistic utils for [Salute Assistants](https://sber.ru/salute) scenario implementation__.

- directly in code autocomplete for intents and app state;
- strongly typed out of the box: whole [SmartApp API](https://developer.sberdevices.ru/docs/ru/developer_tools/amp/smartappapi_description_and_guide) types inside;
- common types between scenario and [Canvas Apps](https://developer.sberdevices.ru/docs/ru/methodology/research/canvasapp);
- common API with [Assistant Client](https://github.com/sberdevices/assistant-client);
- runtime enitity variables and state validation;
- nodejs web-frameworks integration support: [expressjs](https://github.com/expressjs), [hapi](https://github.com/hapijs/hapi), [koa](https://github.com/koajs/koa);
- client frameworks integration support: [NextJS](https://github.com/vercel/next.js), [Gatsby](https://github.com/gatsbyjs);
- any types of recognizers: RegExp, [String Similarity](https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient), [SmartApp Brain](https://developer.sberdevices.ru/docs/ru/developer_tools/ide/platform_ux/nlu_core_caila/nlu_core_caila);
- custom recognizer API;
- intents and entities sync with [SmartApp Brain](https://developer.sberdevices.ru/docs/ru/developer_tools/ide/platform_ux/nlu_core_caila/nlu_core_caila);
- session persisting adapters: memory, mongodb, redis;
- assistants based phrases dictionary declaration support.


## What's inside

- [@salutejs/scenario](https://github.com/sberdevices/salutejs/tree/master/packages/scenario) - фреймворк описания пользовательских сценариев;
- [@salutejs/recognizer](https://github.com/sberdevices/salutejs/tree/master/packages/recognizer) - набор стандартных рекогнайзеров;
- [@salutejs/memory](https://github.com/sberdevices/salutejs/tree/master/packages/memory) - набор стандартных адаптеров для хранения сессии;
- [@salutejs/i18n](https://github.com/sberdevices/salutejs/tree/master/packages/i18n) - библиотека описания словарей реплик персонажей.

### Translations

- [Русский](https://github.com/sberdevices/salutejs/blob/master/README.ru.md)

#### SberDevices with :heart:
