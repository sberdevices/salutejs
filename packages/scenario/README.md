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
const {
    // Аналог функции pipe, позволяет последовательно применить несколько matcher'ов
    match,
    // Матчит на intent. Вторым аргументом принимает параметры.
    // Пример: intent('Название интента', { confidence: 0.7 });
    // Параметр confidence – пороговое значение вероятности, ниже которой интент не будет сматчен
    intent,
    // Матчит на распознанный текст. Вторым аргументом принимает параметры.
    // Пример: text('Название интента', { normalized: true });
    // Параметр normalized – указывает на то, с каким текстом нужно сравнивать, если параметр выставлен true,
    // сравнение будет происходить с human_normalized_text. Defaults to false.
    text,
    // Матчит на название сервер экшена. 
    action,
    // Производит глубое частичное сравнение на переданный state .
    // Пример state({ screen: 'Screen1' }) сматчится со state'ом { screen: 'Screen1', otherParams: 123 }
    state,
    // Матчит на распознанный текст c помощью RegExp. Вторым аргументом принимает параметры.
    // Пример: regexp(/^(записать|напомнить|добавить запись) (?<note>.+)$/i, { normalized: false });
    // Параметр normalized – указывает на то, с каким текстом нужно сравнивать, если параметр выставлен true,
    // сравнение будет происходить с human_normalized_text. Defaults to true;
    // Если в регулярном выражении есть Named Capture Groups, значения этих групп подставится в req.variables.
    // В примере выше если регулярное выражение сматчилось, то в req.variables.note попадет значение.
    regexp
} = createMatchers<SaluteRequest, typeof intents>();
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
    CLOSE_APP: ({ res, session }) => { // реакция на закрытие смартапа
        db.save(session);
    },
    NO_MATCH: ({ res }) => { // реакция на не распознанную реплику
        res.setPronounceText('Я не понимаю');
    },
});
```

## SmartPay

Чтобы оплата работала, необходимо добавить переменную `SMARTPAY_TOKEN` в environment.

### Инициация диалога оплаты

Для отображения диалога оплаты на экране смартаппа, необходимо:
1. Создать счет (вызвать `createInvoice`).
2. Отправить команду на открытие окна оплаты (вызвать хелпер `res.askPayment`).

```ts
import { createInvoice, SaluteHandler } from '@salutejs/scenario';

const handler: SaluteHandler = async ({ req, res }) => {
    const { delivery_info, order } = req.variables;
    const { invoice_id } = await createInvoice({ invoice: { delivery_info, order } });

    res.askPayment(invoice_id);
};
```

### Завершение оплаты

Чтобы узнать о завершении диалога оплаты пользователем,
необходимо подписаться на системный сценарий `PAY_DIALOG_FINISHED`.

```ts
import { createSystemScenario, findInvoice, PayDialogFinishedServerAction, PayDialogStatuses, PaymentInvoiceStatuses } from '@salutejs/scenario';

createSystemScenario({
    PAY_DIALOG_FINISHED: async ({ req, res }) => {
        const { parameters } = req.serverAction as PayDialogFinishedServerAction;
        if (parameters.payment_response.response_code === PayDialogStatuses.success) {
            // диалог завершился успешно, необходимо проверить статус платежа
            const { invoice_status } = await findInvoice({ invoiceId: parameters.payment_response.invoice_id });
            if (invoice_status === PaymentInvoiceStatuses.confirmed) {
                // оплачено и можно формировать заказ
            }
        }
    }
});
```

## SmartPush

Пуши требуют наличия переменных окружения - `SMARTPUSH_CLIENTID` и `SMARTPUSH_SECRET`, не забудьте добавить их в environment.
Ниже пример подготовки и отправки пуша:

```ts
import { createSmartPushSender, SendPushConfiguration, SmartPushResponse } from 'salutejs/scenario';

const pushes: SendPushConfiguration[] = [{
        projectId: '', // id аппа из кабинета разработчика https://developers.sber.ru/
        clientIdSub: '', // sub из запросов клиента
        deliveryConfig: {
            deliveryMode: 'BROADCAST', // тип доставки
            destinations: [
                {
                    surface: 'COMPANION', // поверхность (Сбер салют)
                    templateContent: {
                        id: '', // id шаблона уведомления из студии
                        headerValues: { }, // переменные для заголовка уведомления
                        bodyValues: { }, // переменные для тела уведомления
                    },
                },
            ],
        },
    }];
const sendPush = await createSmartPushSender();
pushes.forEach((push) =>
    sendPush(push).then(({ payload }: SmartPushResponse) => {
        if (payload.validation.results.some(({ status }) => status.code !== 0)) {
            throw new Error('Уведомление не отправлено');
        }
    }),
);
```

## SmartProfile

Для получения данных о пользователе из сервиса SmartProfile, необходимо:
1. Отправить запрос на получение данных (`SaluteResponse.getProfileData()`).
2. Обработать входящее сообщение `messageName='TAKE_PROFILE_DATA'`.

Пример:

```ts
import { createSystemScenario, createUserScenario, NLPRequestTPD } from '@salutejs/scenario';

const systemScenario = createSystemScenario({
    RUN_APP: ({ res }) => {
        // отправляем запрос на получение данных пользователя
        res.getProfileData();
    },
});

const userScenario = createUserScenario({
    Profile: {
        match: (req) => req.request.messageName === 'TAKE_PROFILE_DATA',
        handle: ({ res, req }) => {
            // обрабатываем полученный ответ, заполняем pronounceText
            const name = req.profile?.customer_name;
            if (name) {
                res.setPronounceText(`Привет, ${name}`);
                return;
            }

            const statusCode = (req.request.payload as NLPRequestTPD['payload']).status_code;

            res.setPronounceText(`Почему-то не получили ваше имя, статус ошибки ${statusCode.code}`);
        },
    },
});
```

## i18n

Интерфейс для адаптации текста с динамическими параметрами и плюрализацией в рамках персонажей семейства виртуальных ассистентов Салют.

### Создание словарей

Файлы с адаптацией лежат рядом с кодом, к которому они логически относятся.

```
src/handlers/mainPage
├── mainPage.i18n
│   ├── sber.ts — словарь для персонажа Сбер
│   ├── joy.ts — словарь для персонажа Джой
│   ├── athena.ts — словарь для персонажа Афина
│   └── index.ts — карта персонажей
```

Файл словаря — модуль, в котором лежит кейсет для одного языка с парами `{ ключ, перевод }`:

``` ts
// mainPage/mainPage.i18n/sber.ts
export const sber = {
    Пока: 'Bye',
    Привет: 'Example',
};
```

Все словари должны быть объявлены в карте персонажей. Картой оперирует модуль i18n.
```ts
// mainPage/mainPage.i18n/index.ts
export * from './sber';
export * from './joy';
export * from './athena';
```

### Использование

``` ts
// mainPage/mainPage.ts
import * as keyset from './mainPage.i18n';

// ...
handle: ({ req, res }) => {
    const greeting = req.i18n(keyset);
    res.setPronounceText(greeting('Привет'));
},
// ...
```

### Параметризация

Параметры объявляются в синтаксисе схожем с параметрами для [template strings](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/template_strings).

``` ts
// mainPage/mainPage.i18n/sber.ts
export const sber = {
    'Добрый день, {name}!': 'Добрый день, {name}!',
}
```

``` ts
// mainPage/mainPage.i18n/joy.ts
export const joy = {
    'Добрый день, {name}!': 'Привет, {name}!',
}
```

``` ts
// mainPage/mainPage.ts
import * as keyset from './mainPage.i18n';

// ...
handle: ({ req, res }) => {
    const greeting = req.i18n(keyset);
    res.setPronounceText(greeting('Добрый день, {name}!', {
        name: 'Костя',
    }));
},
// ...
```

### Плюрализация

Для выражения плюрализация существует специальный параметр `count`. Который соотносится с вариантами написания ключа через вложенные параметры: `many`, `some`, `one`, `none`.

``` ts
// mainPage/mainPage.i18n/sber.ts
export const sber = {
    '{count} операций': {
        many: '{count} операция',
        none: 'нет операций',
        one: '{count} операция',
        some: '{count} операции',
    }
}
```

```ts
// mainPage/mainPage.ts
import * as keyset from './mainPage.i18n';

// ...
handle: ({ req, res }) => {
    const transactions = req.i18n(keyset);
    res.setPronounceText(transactions('{count} операций', {
        count: 2,
    }));
},
// ...
```

#### SberDevices with :heart:
