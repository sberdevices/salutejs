/* eslint-disable no-shadow */
/** Тип оплаты счета */
export enum PaymentTypes {
    /** одностадийная оплата */
    oneStage = 0,
    /** двухстадийная оплата */
    twoStage = 1,
}

/** Система налогообложения */
export enum TaxSystemTypes {
    /** общая */
    obshii = 0,
    /** упрощенная, доход */
    uproshennui = 1,
    /** упрощенная, доход минус расход */
    dohodMinusRashod = 2,
    /** единый налог на вмененный доход */
    endfl = 3,
    /** единый сельскохозяйственный налог */
    esn = 4,
    /** патентная система налогообложения */
    patent = 5,
}

/** Значение ставки НДС */
export enum NdsTypes {
    /** без НДС */
    without = 0,
    /** НДС по ставке 0% */
    zeroPercent = 1,
    /** НДС по ставке 10% */
    tenPercent = 2,
    /** НДС по ставке 18% */
    eighteenPercent = 3,
    /** НДС по ставке 10/110 */
    tenToOneTen = 4,
    /** НДС по ставке 18/118 */
    eighteenToOneEighteen = 5,
    /** НДС по ставке 20% */
    twentyPercent = 6,
    /** НДС по ставке 20/120 */
    twentyToOneTwenty = 7,
}

export type Currency = 'RUB' | 'EUR' | 'USD';

export enum PaymentReponseStatuses {
    /** Запрос обработан успешно */
    success = 200,
    /** Один из параметров в запросе передан в некорректном формате, либо формат запроса некорректный */
    wrongRequest = 400,
    /** Использован недействительный или неверный API Key (токен) */
    wrongApiKey = 401,
    /** Внутренняя ошибка работы сервиса. Обратитесь в поддержку для устранения неполадки */
    serviceError = 403,
}

export enum PaymentInvoiceStatuses {
    /** заказ оплачен */
    confirmed = 0,
    /** заказ создан и ожидает выбора платежного инструмента */
    created = 1,
    /** заказ находится в процессе оплаты */
    executed = 2,
    /** деньги временно заблокированы (только для двухстадийного платежа */
    paid = 3,
    /** заказ отменен пользователем */
    cancelled = 4,
    /** заказ отменен продавцом */
    reversed = 6,
    /** осуществлен полный возвра */
    refunded = 7,
}

export interface PaymentInvoice {
    /** Блок информации о покупателе */
    purchaser?: {
        /** Email покупателя (несколько значений передаются через ",") */
        email: string;
        /** Телефон покупателя */
        phone: string;
        /** Способ связи с покупателем */
        contact?: string;
    };
    /** Блок информации о параметрах доставки */
    delivery_info?: {
        /** Блок, содержащий набор параметров с адресом покупателя */
        address: {
            /** Страна покупателя */
            country: string;
            /** Город покупателя */
            city: string;
            /** Адрес покупателя (улица, дом, квартира и т.д) */
            address: string;
        };
        /** Тип доставки */
        delivery_type: string;
        /** Дополнительное описание для доставки */
        description?: string;
    };
    /** Блок, содержащий дополнительные параметры покупки
     * (используется, если необходимо как-то маркировать оплату) */
    invoice_params?: Array<{ key: string; value: string }>;
    /** Блок информации о заказе */
    order: {
        /** Идентификатор заказа для сервиса платежей.
         * Должен быть уникален в рамках выделенного для приложения service_id,
         * иначе не будет создан новый invoice_id */
        order_id: string;
        /** Дата и время заказа */
        order_date: string;
        /** Номер заказа для отображения покупателю и отслеживания статуса заказа.
         * Рекомендуем сделать его максимально понятным и простым для восприятия */
        order_number?: string;
        /** Идентификатор сервиса, полученный при выдаче токена для авторизации запроса */
        service_id: string;
        /** Сумма заказа (без разделителя, в копейках) */
        amount: number;
        /** Код валюты в формате ISO 4217 */
        currency: Currency;
        /** Наименование вашего юридического лица */
        purpose: string;
        /** Описание платежа для отображения плательщику */
        description: string;
        /** Указание языка, в котором передаются все текстовые поля в запросе */
        language: 'ru-RU';
        /** Дата истечения срока оплаты.
         * По умолчанию на оплату отводится 20 минут от момента регистрации платежа.
         * Если есть необходимость увеличить или уменьшить это время, нужно передать данное поле */
        expiration_date?: string;
        /** Дата и время автоматического завершения платежа (только для двухстадийных платежей) */
        autocompletion_date?: string;
        /** Система налогообложения */
        tax_system: TaxSystemTypes;
        /** Описание корзины покупок для передачи в налоговую и формирования фискального чека */
        order_bundle: Array<{
            /** Номер позиции в корзине для добавления в фискальный чек. Должен быть уникален в рамках заказа */
            position_id: number;
            /** Наименование или описание товарной позиции */
            name: string;
            /** Дополнительные параметры, уточняющие товарную позицию */
            item_params?: Array<{ key: string; value: string }>;
            /** Описывает количественные характеристики определенной позиции корзины */
            quantity: {
                /** Количество товаров в позиции. Для разделителя используйте "." */
                value: number;
                /** Единица измерения количества для значения из поля value */
                measure: string;
            };
            /** Цена определенной товарной позиции корзины (без разделителя, в копейках).
             * Сумма всех товарных позиций должна совпасть с общей суммой платежа (order.amount).
             * Рассчитывается как item_price * quantity */
            item_amount: number;
            /** Код валюты в формате ISO 4217 */
            currency: Currency;
            /** Номер (идентификатор) товарной позиции в системе магазина.
             * Параметр должен быть уникальным в рамках запроса */
            item_code: string;
            /** Цена одной единицы (value) данной товарной позиции (position_id).
             * Указывается без разделителя, в копейках */
            item_price: number;
            /** Тип скидки на товарную позицию */
            discount_type?: 'percent';
            /** Значение скидки на товарную позицию */
            discount_value?: number;
            /** Тип агентской комиссии за продажу товара (применимо только для агентской схемы) */
            interest_type?: 'agentPercent';
            /** Значение агентской комиссии за продажу товара (применимо только для агентской схемы) */
            interest_value?: number;
            /** Значение ставки НДС */
            tax_type: NdsTypes;
            /** Сумма налога, посчитанная продавцом (без разделителя, в копейках) */
            tax_sum: number;
        }>;
    };
}

/** Запрос счета */
export interface PaymentInvoiceQuery {
    /** Тип оплаты счета, по умолчанию используется одностадийная оплата */
    ptype?: PaymentTypes;
    /** В этом блоке передается вся информация о регистрируемой покупке */
    invoice: PaymentInvoice;
}

export interface PaymentError {
    /** Код ответа */
    error_code: PaymentReponseStatuses;
    /** Техническое описание кода ошибки / ответа */
    error_description: string;
    /** Описание кода ошибки / ответа */
    user_message: string;
}

export interface PaymentStatus {
    /** Код ответа */
    code: PaymentReponseStatuses;
    /** Блок, содержащий описание ошибки или ответа */
    error: PaymentError;
    /** ID счета, по которому был направлен запрос */
    invoice_id: string;
    /** Дата и время создания счета */
    invoice_date: string;
    /** Текущий статус счета */
    invoice_status: PaymentInvoiceStatuses;
    /** Блок передается только при коде ответа "200" */
    invoice?: PaymentInvoice;
    /** Все параметры блока invoice, переданные при создании счета */
    payment_info: {
        /** Идентификатор проведенной оплаты */
        payment_id: string;
        /** Идентификатор (токен) карты, использованной при оплате (если использовалась сохраненная карта) */
        card_id: string;
        /** Имя карты, заданной плательщиком (если использовалась сохраненная карта) */
        name: string;
        /** Маскированный номер карты */
        masked_pan: string;
        /** Срок действия карты */
        expiry_date: string;
        /** Имя плательщика на карте */
        cardholder: string;
        /** Платежная система, в которой зарегистрирована карта */
        payment_system: string;
        /** Ссылка на логотип платежной системы */
        payment_system_image: string;
        /** Ссылка на логотип карты в интерфейсе платежного устройства */
        image: string;
        /** Название платежного сервиса, через который был проведен платеж */
        paysys: string;
        /** Ссылка на лого платежного сервиса */
        paysys_image: string;
        /** Блок информации о банке плательщика */
        bank_info: {
            /** Название банка, выпустившего карту */
            bank_name: string;
            /** Код страны банка, выпустившего карту */
            bank_country_code: string;
            /** Название страны банка, выпустившего карту */
            bank_country_name: string;
            /** Ссылка на логотип банка, выпустившего карту */
            bank_image: string;
        };
    };
    /** Платежные инструменты */
    payment_methods: {
        /** Необязательное сообщение пользователю */
        user_message?: string;
        /** Способы оплаты */
        methods: {
            /** Код способа оплаты */
            method: 'card' | 'QR' | 'new';
            /** Название кнопки оплаты */
            action: string;
        };
    };
    /** Массив с описанием данных банковских карт */
    cards: Array<{
        /** Идентификатор карты */
        card_id: string;
        /** Имя карты, указанное клиентом */
        name: string;
        /** Маскированный номер карты */
        masked_pan: string;
        /** Срок истечения действия карты в формате YYYYMM */
        expiry_date: string;
        /** Имя держателя карты, указанное при оплате */
        cardholder: string;
        /** Наименование платежной системы */
        payment_system: string;
        /** Логотип платежной системы */
        payment_system_image: string;
        /** Логотип карты */
        image: string;
        /** Наименование платежного оператор */
        paysys: string;
        /** Логотип платежного оператора */
        paysys_image: string;
        /** Данные банка-эмитента */
        bank_info: {
            /** Наименование банка-эмитент */
            bank_name: string;
            /** Код страны банка-эмитента */
            bank_country_code: string;
            /** Наименование страны банка-эмитента */
            bank_country_name: string;
            /** Ссылка на логотип банка */
            bank_image: string;
        };
    }>;
    /** URL платежной формы, на который надо перенаправить браузер клиента */
    form_url: string;
}

export interface PaymentResponse {
    /** Блок, содержащий описание ошибки / ответа */
    error: PaymentError;
}

export interface PaymentInvoiceAnswer {
    /** Код ответа */
    code?: number;
    /** Блок, содержащий описание ошибки / ответа */
    error: PaymentError;
    /** ID зарегистрированной оплаты */
    invoice_id?: number;
}

export enum PayDialogStatuses {
    /** успешная оплата */
    success = 0,
    /** неожиданная ошибка */
    unexpectedError = 1,
    /**
     * пользователь закрыл смартап.
     * При получении этого кода необходимо дополнительно отправить запрос на проверку статуса платежа,
     * чтобы отобразить результат пользователю */
    smarappClosed = 2,
    /** невозможно начать оплату, так как отображается другой сценарий оплаты */
    anotherPay = 3,
    /** время оплаты счета истекло */
    timesUp = 4,
    /** оплата отклонена бэкендом */
    rejected = 5,
    /** состояние оплаты неизвестно */
    unknown = 6,
    /** оплата для данной поверхности недоступна */
    unavailable = 7,
}

export interface PayDialogFinishedServerAction {
    action_id: 'PAY_DIALOG_FINISHED';
    parameters: {
        payment_response: {
            response_code: PayDialogStatuses;
            invoice_id: string;
        };
        app_info: {
            projectId: string;
            systemName: string;
        };
    };
}
