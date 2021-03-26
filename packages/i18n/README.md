# @salutejs/i18n

Интерфейс для адаптации текста с динамическими параметрами и плюрализацией в рамках персонажей семейства виртуальных ассистентов Салют.

## Создание словарей

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


## Использование

``` ts
// mainPage/mainPage.ts
import i18n from '@salutejs/i18n';

import * as keyset from './mainPage.i18n';

const greeting = i18n(keyset);
greeting('Привет');
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
import i18n from '@salutejs/i18n';

import * as keyset from './mainPage.i18n';

const greeting = i18n(keyset);

greeting('Добрый день, {name}!', {
    name: 'Костя',
});
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
import i18n from '@salutejs/i18n';

import * as keyset from './mainPage.i18n';

const transactions = i18n(keyset);

transactions('{count} операций', {
    count: 2,
});
```

#### SberDevices with :heart:
