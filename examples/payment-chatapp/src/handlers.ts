import {
    createInvoice,
    PayDialogFinishedServerAction,
    PayDialogStatuses,
    PaymentInvoice,
    SaluteHandler,
    SaluteRequest,
    TaxSystemTypes,
} from '@salutejs/scenario';

import { createGalleryCard, createOrderBundle } from './cards';
import { PaymentState, Product, ProductVariable } from './types';
import products from './products.json';

const productMap: Record<string, Product> = products.reduce((acc, p) => {
    acc[p.code] = p;
    return acc;
}, {});

export const runApp: SaluteHandler = ({ res }) => {
    res.appendCard(createGalleryCard(products));
    res.appendSuggestions(['Хочу большую', 'Хочу маленькую']);
};

export const appendHandler: SaluteHandler<SaluteRequest<ProductVariable>, PaymentState> = ({ req, res, session }) => {
    const { product } = req.variables;
    const found = products.find((p) => p.synonyms.some((s) => s.toLowerCase() === product.toLowerCase()));
    if (!found) {
        return;
    }

    if (!session.cart) {
        session.cart = {};
    }

    if (!session.cart[found.code]) {
        session.cart[found.code] = 0;
    }

    session.cart[found.code] += 1;
    res.setPronounceText('Добавлено');
    res.appendBubble('Добавлено');
    res.appendSuggestions(['В корзину']);
};

export const removeHandler: SaluteHandler<SaluteRequest<ProductVariable>, PaymentState> = ({ req, res, session }) => {
    const { product } = req.variables;
    const found = products.find((p) => p.synonyms.some((s) => s.toLowerCase() === product.toLowerCase()));
    if (!found) {
        return;
    }

    if (!session.cart) {
        session.cart = {};
    }

    if (!session.cart[found.code]) {
        session.cart[found.code] = 0;
    }

    session.cart[found.code] = session.cart[found.code] > 0 ? session.cart[found.code] - 1 : 0;
    res.setPronounceText('Удалено');
    res.appendBubble('Удалено');
};

export const cartHandler: SaluteHandler<SaluteRequest, PaymentState> = ({ res, session }) => {
    const items: PaymentInvoice['order']['order_bundle'] = [];
    const cartItems = Object.keys(session.cart || {});
    let index = 0;
    cartItems.forEach((item) => {
        if (session.cart[item] <= 0) {
            return;
        }

        items.push({
            position_id: index++,
            name: productMap[item].title,
            item_code: productMap[item].code,
            item_price: Number(productMap[item].price),
            item_amount: session.cart[item] * productMap[item].price,
            quantity: {
                value: session.cart[item],
                measure: 'шт.',
            },
            currency: 'RUB',
            tax_type: 0,
            tax_sum: 0,
        });
    });

    if (items.length <= 0) {
        res.appendBubble('Корзина пустая');
        res.setPronounceText('Корзина пустая');
        return;
    }

    session.bundle = items;
    res.appendCard(createOrderBundle(items));
    res.appendSuggestions(['Оплатить', 'Продолжить']);
};

export const paymentHandler: SaluteHandler<SaluteRequest, PaymentState> = async ({ res, session }) => {
    const { bundle } = session;

    const { invoice_id, error } = await createInvoice({
        invoice: {
            order: {
                order_id: new Date().getTime().toString(),
                order_date: `${new Date().toISOString().split('.')[0]}+03:00`,
                currency: 'RUB',
                language: 'ru-RU',
                service_id: process.env.SMARTPAY_SERVICEID || '',
                purpose: 'ПРОДАВЕЦ ВОДЫ',
                description: 'Заказ воды',
                amount: bundle.reduce((acc, item) => acc + item.item_amount, 0),
                tax_system: TaxSystemTypes.obshii,
                order_bundle: [...bundle],
            },
        },
    });

    if (typeof invoice_id === 'undefined') {
        res.appendBubble(error.error_description);
        return;
    }

    res.askPayment(invoice_id);
};

export const payDialogFinished: SaluteHandler<SaluteRequest, PaymentState> = ({ req, res, session }) => {
    const { parameters } = (req.serverAction as unknown) as PayDialogFinishedServerAction;
    if (parameters.payment_response.response_code === PayDialogStatuses.success) {
        res.setPronounceText('Оплачено');
        res.appendBubble('Оплачено');
        session.cart = {};
        session.bundle = [];
    } else {
        res.setPronounceText(`Ошибка ${parameters.payment_response.response_code}`);
        res.appendBubble(`Ошибка ${parameters.payment_response.response_code}`);
    }
};
