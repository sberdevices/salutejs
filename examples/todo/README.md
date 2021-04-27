Пример смартаппа на next.js

## Запуск локально

1. Создать файл .env, заполнить поля в нем.
2. Запустить dev-сервер

```bash
npm run dev
# or
yarn dev
```

3. Сделать туннель в интернет.

Например, используем `ngrok`.
```bash
ngrok http 3000
```

4. Зайти в (смартапп студию)[https://smartapp-studio.sberdevices.ru/].

Создать канвас, задать следующие параметры:
 - Webhook смартапа: туннель+/api/hook
 - Frontend Endpoint: туннель

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
