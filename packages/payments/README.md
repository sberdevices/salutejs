# @salutejs/payments

Реализация методов приема платежей.

> npm i -S @salutejs/payments

Чтобы оплата работала, необходимо добавить переменную PAYMENT_TOKEN в environment.

## Инициация диалога оплаты

Для отображения диалога оплаты на экране смартаппа, необходимо:
1. Создать счет (вызвать `createInvoice`).
2. Отправить команду на открытие окна оплаты (вызвать хелпер `res.askPayment`).

```ts
import { createInvoice } from '@salutejs/payments';
import { SaluteHandler } from '@salutejs/types';

const handler: SaluteHandler = async ({ req, res }) => {
    const { delivery_info, order } = req.variables;
    const { invoice_id } = await createInvoice({ invoice: { delivery_info, order } });

    res.askPayment(invoice_id);
};
```

## Завершение оплаты

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

#### SberDevices with :heart:
