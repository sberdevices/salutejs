import fetch from 'node-fetch';

import { PaymentInvoiceQuery, PaymentInvoiceAnswer, PaymentResponse, PaymentStatus } from './types/payment';

const API_URL = 'https://smartmarket.online.sberbank.ru/smartpay/v1';

const callApi = <T>(
    url: string,
    { method, body }: { method?: 'patch' | 'post' | 'put' | 'delete'; body?: unknown } = {},
): Promise<T> =>
    fetch(url, {
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SMARTPAY_TOKEN}`,
        },
        method: method || 'get',
        body: body ? JSON.stringify(body) : undefined,
    }).then((response) => response.json());

/**
 * Регистрирует платеж
 * @param invoice объект счета
 * @returns объект-статус регистрации платежа
 */
export const createInvoice = (invoice: PaymentInvoiceQuery): Promise<PaymentInvoiceAnswer> =>
    callApi<PaymentInvoiceAnswer>(`${API_URL}/invoices`, {
        method: 'post',
        body: invoice,
    });

/**
 * Возвращает статус платежа по идентификатору счета
 * @param invoiceId идентификатор счета
 * @param params объект с параметрами запроса - статусом счета и временем ожидания результата
 * @returns объект-статус платежа
 */
export const findInvoiceById = (
    invoiceId: string,
    params: { invStatus?: string; wait: number },
): Promise<PaymentStatus> =>
    callApi(
        `${API_URL}/invoices/${encodeURIComponent(invoiceId)}${
            params && (params.invStatus || typeof params.wait !== 'undefined')
                ? `?${params.invStatus ?? `inv_status=${encodeURIComponent(!params.invStatus)}`}${
                      params.wait ?? `${params.invStatus ?? '&'}wait=${encodeURIComponent(params.wait)}`
                  }`
                : ''
        }`,
    );

/**
 * Возвращает статус платежа по идентификатору сервиса и заказа
 * @param serviceId Идентификатор сервиса, полученный при выдаче токена для авторизации запроса
 * @param orderId Идентификатор заказа для сервиса платежей
 * @param params объект с параметрами запроса - статусом счета и временем ожидания результата
 * @returns объект-статус платежа
 */
export const findInvoiceByServiceIdOrderId = (
    serviceId: string,
    orderId: string,
    params: { invStatus?: string; wait?: number } = {},
): Promise<PaymentStatus> =>
    callApi(
        `${API_URL}/invoices/0?service_id=${encodeURIComponent(serviceId)}&order_id=${encodeURIComponent(orderId)}${
            params.invStatus ??
            `&inv_status=${encodeURIComponent(!params.invStatus)}${
                params.wait ?? `&wait=${encodeURIComponent(!params.wait)}`
            }`
        }`,
    );

/**
 * Завершает платеж
 * @param invoiceId идентификатор счета
 * @returns объект-результат запроса
 */
export const completeInvoice = (invoiceId: string): Promise<PaymentResponse> =>
    callApi(`${API_URL}/invoice/${encodeURIComponent(invoiceId)}`, {
        method: 'put',
    });

/**
 * Отменяет платеж
 * @param invoiceId идентификатор счета
 * @returns объект-результат запроса
 */
export const reverseInvoice = (invoiceId: string): Promise<PaymentResponse> =>
    callApi(`${API_URL}/invoice/${encodeURIComponent(invoiceId)}`, {
        method: 'delete',
    });

/**
 * Возвращает платеж
 * @param invoiceId идентификатор счета
 * @returns объект-результат запроса
 */
export const refundInvoice = (invoiceId: string): Promise<PaymentResponse> =>
    callApi(`${API_URL}/invoice/${encodeURIComponent(invoiceId)}`, {
        method: 'patch',
    });
