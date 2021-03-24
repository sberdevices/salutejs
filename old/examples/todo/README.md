# Как запустить canvas и сценарий?

## Запустить и проксировать сценарий.

```sh
salutejs$ npm ci
salutejs$ npm start
salutejs$ ngrok http 3000
```

## Настроить и запустить canvas

1. Идём на страницу SmartApp Studio ([ссылка](https://smartapp-studio.sberdevices.ru/));
1. В меню пользователя (правый верхний угол) выбираем "Настройки профиля";
1. Нажимаем "Auth Token";
1. Нажимаем "Обновить ключ";
1. Нажимаем "Скопировать ключ" (сейчас token в буфере);
1. Идем в каталог src/examples/todo/canvas
1. Указываем токен (предыдущий пункт) и имя проекта (из "SmartApp Studio") в файле ".env.sample", в строках "REACT_APP_TOKEN" и "REACT_APP_SMARTAPP" соответственно;
1. Переименовываем файл ".env.sample" в ".env".

```sh
salutejs$ cd src/examples/todo/canvas
canvas$ npm ci
canvas$ npm start
```

## Создать проект canvas-app в smartapp-studio

1. [Открыть](https://smartapp-studio.sberdevices.ru) smartapp-studio.
1. Cоздать новый апп типа canvas.
1. В "Выбор инструмента" указать "Есть готовый смартапп".
1. В "Webhook" скопировать урл прокси сценария + добавить /hook (например, https://e3d7a87ed022.ngrok.io/hook).

## Запуск смартаппа на устройстве

1. Запустить canvas (с флагом NODE_ENV=production) и проксировать фронт (`$ ngrok http 3001`).
2. В smartapp-studio, в настройках canvas, в поле "Frontend Endpoint" скопировать урл прокси фронта (например, https://4fcb59f2d51b.ngrok.io).