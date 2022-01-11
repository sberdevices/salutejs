import { Surface, UserChannel } from './systemMessage';

export type ProtocolVersion = 'V1';

export interface Sender {
    /** Идентификатор проекта или навыка */
    projectId: string;
    /** Информация о приложении */
    application?: {
        /** Идентификатор приложения */
        appId: string;
        /** Версия приложения */
        versionId: string;
    };
}

export interface Recipient {
    /** Информация о клиенте */
    clientId: {
        /** Тип идентификатора Клиента. Принимает значение SUB */
        idType: string;
        /** Идентификатор Клиента */
        id: string;
    };
}

export interface MobileAppParameters {
    /** Сценарий для Android-устройств */
    deeplinkAndroid?: string;
    /** Сценарий для iOS-устройств */
    deeplinkIos?: string;
    /** Минимальная версия приложения на Android, с которой доступен сценарий */
    androidVersion?: string;
    /** Минимальная версия приложения на iOS, с которой доступен сценарий */
    iosVersion?: string;
    /** Текст для кнопки. Пример «Подробнее» */
    buttonText?: string;
    /** Ссылка на картинку из внешнего источника */
    imageLink?: string;
}

export interface DeviceSerialFilter {
    /** Серийный номер устройства */
    serialNumber?: string;
    /** Кодовое название продукта */
    product?: string;
}

export interface TimeFrame {
    /** Стартовое время отправки push-уведомления. Пример: "13:30:00" */
    startTime: string;
    /** Финальное время отправки push-уведомления.
     * После этого времени в текущую дату уведомления не отправляются, если значение end_date больше текущей даты */
    finishTime: string;
    /** Часовой пояс в формате GMT+hh:mm */
    timeZone: string;
    /** Стартовая дата отправки push-уведомления. Пример: "2020-06-04" */
    startDate: string;
    /** Финальная дата времени отправки push-уведомления. При отсутствии выбирается дата из start_date */
    endDate?: string;
}

export interface DeviceParameters {
    /** Ссылка на фоновую картинку */
    backgroundImageUri?: string;

    deepLink: string;
    /** Фильтр по устройствам пользовател */
    deviceSerialFilter?: DeviceSerialFilter;
    /** Фильтр по типу продукта */
    productFilter?: string;
}

export interface Destination {
    /** Канал получателя. Пример: B2C */
    channel: UserChannel;
    /** Поверхность получателя. Пример: SBERBOX */
    surface: Surface;
    /** Приоритет отправки пуш-уведомления относительно других получателей в блоке destinationsConfig,
     * где 0 — высший приоритет. При type = broadcast не учитывается */
    priority?: number;
    templateContent: {
        /** Идентификатор шаблона */
        id: string;
        /** Параметры заголовка запроса, содержит string и в сумме не более 480. Не более 3 значений */
        headerValues: Record<string, string>;
        /** Параметры тела запроса, содержит string и в сумме не более 480. Не более 10 значений */
        bodyValues: Record<string, string>;
        /** Объект, внутри которого передаются параметры для отправки на мобильное устройство */
        mobileAppParameters?: MobileAppParameters;
        /** Блок с параметрами для отправки в StarOS */
        deviceParameters?: DeviceParameters;
        /** Настройки времени для отложенной отправки push-уведомления под текущим номером.
         * Дата и время передаются в формате ISO */
        timeFrame?: TimeFrame;
    };
}

export interface DeliveryConfig {
    /** Тип доставки (broadcast (отправка на все устройства) или sequential (отправка на устройства/МП,
     * в зависимости от приоритета)) */
    deliveryMode: 'BROADCAST' | 'SEQUENTIAL';
    /** Настройки получателя */
    destinations: Destination[];
}

export interface SmartPushPayload {
    /** Информация об отправителе */
    sender: Sender;
    /** Информация о получателе */
    recipient: Recipient;
    /** Настройки доставки */
    deliveryConfig: DeliveryConfig;
}

export interface SmartPushRequest {
    /** Версия протокола */
    protocolVersion: ProtocolVersion;
    /** Идентификатор клиентского сообщения в рамках сессии */
    messageId: number;
    /** Тип сообщения — SEND_PUSH */
    messageName: 'SEND_PUSH';
    /** Бизнес параметры */
    payload: SmartPushPayload;
}

export enum SmartPushStatusCode {
    /** Успешно */
    success = 0,
    /** Ошибка при нарушении правил proto (нарушены тип поля, его размерность или обязательность) */
    schemaValidationError = 1000,
    /** Ошибка в целостности данных входящего запроса (в одном пуше указаны блоки PushContent и TemplateContent,
     * destination пустой, неправильные времена в start_time и finish_time или неправильный message_name) */
    messageValidationError = 1001,
    /** Указан недопустимый тип client Id */
    clientIdTypeInvalid = 1002,
    /** Ошибка в параметрах типа отправки */
    deliveryTypeError = 1003,
    /** Указанного channel/origin_channel или указанного surface/origin_surface нет */
    unknownSurfaceOfChannel = 1004,
    /** Указанная поверхность отправки не определена */
    surfaceNotDefined = 1005,
    /** В блоке destination одновременно указаны блоки для мобильных поверхностей и устройств */
    destinationHasBothMobileAppAndDeviceParameters = 1006,
    /** Origin_surface из запроса не определена */
    unknownOriginSurface = 1007,
    /** Указано невалидное время */
    specifiedTimeValidationError = 1008,
    /** Для отправки на мобильное приложение переданы параметры для устройства или наоборот */
    surfaceParametersError = 1009,
    /** В запросе указан sub не по формату */
    subFormatInvalid = 1012,
    /** Для данного навыка не включена возможность отправлять Push-уведомления */
    sendingNotificationsForThisProjectOrAppForbidden = 1013,
    /** Превышен лимит на отправку push-уведомлений (минутный, часовой или суточный) */
    sendingLimitExceeded = 1014,
    /** В запросе на устройство одновременно заполнены deviceSerialFilter и productFilter */
    deviceFiltersHaveBothDeviceSerialFilterAndProductFilter = 1015,
    /** Указанный шаблон для данного projectId не существует */
    specifiedTemplateForSpecifiedProjectNotExist = 1016,
    /** Параметры в запросе не указаны в шаблоне или указаны поля, которые в шаблоне не определены */
    specifiedTemplateParamsInvalid = 1017,
    /** Достигнут лимит на отправку push-уведомлений этому клиенту */
    clientSendingLimitExceeded = 1018,
}

export interface SmartPushError {
    key: string;
    message: string;
}

export interface SmartPushResponsePayload {
    /** Идентификатор клиентского сообщения в рамках сессии */
    messageId: number;
    /** Тип сообщения, PUSH_RESULT или PUSH_SENDING_RESULT */
    messageName: string;
    /** Версия протокола */
    protocolVersion: ProtocolVersion;
    /** Результат валидации запроса на отправку */
    validation?: {
        /** Результаты обработки сообщения */
        results: {
            /** Поверхность, по которой проводились проверки */
            surface: string;
            /** Информация по статусу пуш-уведомления на поверхность */
            status: {
                /** Код статуса */
                code: SmartPushStatusCode;
                /** Описание статуса */
                descr: string;
            };
        }[];
    };
    /** Результат отправки пуш-уведомления */
    result?: {
        /** Поверхность, куда отправили пуш */
        surface: string;
        /** Информация по статусу доставки */
        status: {
            /** Код статуса */
            code: SmartPushStatusCode;
            /** Описание статуса */
            description: string;
        };
        /** Информация по статусам доставки, в разрезе на девайсы */
        deviceStatuses?: {
            /** Идентификатор устройства, куда полетел пуш */
            deviceId?: string;
            /** Название продукта, куда полетел пуш */
            product?: string;
            /** Информация по статусу доставки */
            status: {
                /** Код статуса */
                code: SmartPushStatusCode;
                /** Описание статуса */
                description: string;
            };
        }[];
    };
}

export interface SmartPushResponse {
    /** Идентификатор запроса, переданный клиентом */
    requestId: string;
    /** Идентификатор ответа сервера */
    responseId: string;
    /** Время формирования ответа */
    timeStamp: string;
    /** Блок с деталями ответа */
    payload?: SmartPushResponsePayload;
    /** Код ответа (HTTP) */
    code: number;
    /** Блок с деталями ошибок */
    errors?: SmartPushError[];
}
