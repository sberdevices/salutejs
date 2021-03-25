import { AppInfo, Device, UUID, Character } from './global';

export enum NLPRequestType {
    /** Cообщение для смартапа от ассистента */
    MESSAGE_TO_SKILL = 'MESSAGE_TO_SKILL',
    /**
     * Сообщает смартапу о действиях пользователя на фронтенде,
     * а также фоновые действия полноэкранных приложений
     */
    SERVER_ACTION = 'SERVER_ACTION',
    /** Сообщает о запуске смартапа */
    RUN_APP = 'RUN_APP',
    /**
     * Сообщает о закрытии и не требует ответа от смартапа.
     * Содержимое сообщения совпадает с содержимым payload сообщения MESSAGE_TO_SKILL.
     */
    CLOSE_APP = 'CLOSE_APP',
}

/** Список подцензурных категорий, обнаруженных в тексте или реплике пользователя */
export enum CensorClass {
    /** Наличие политиков из списка */
    politicians = 'politicians',
    /** Наличие нецензурной лексики */
    obscene = 'obscene',
    /** Вероятность негатива */
    model_response = 'model_response',
}

type PhraseEmotions = 'negative' | 'positive' | 'neutral';

/** Общие характеристики сообщения пользователя */
export interface Annotations {
    /** Информация о прохождении цензуры */
    censor_data: {
        classes: CensorClass[];
        /** Коэффициенты подцензурных категорий в диапазоне от 0 до 1 */
        probas: number[];
    };
    /** Эмоциональная окраска текста пользователя */
    text_sentiment: {
        /** Список характеристик эмоциональной окраски текста пользователя */
        classes: PhraseEmotions[];
        /** Коэффициенты той или иной эмоциональной характеристики текста пользователя в диапазоне от 0 до 1 */
        probas: number[];
    };
    /** Эмоциональная окраска голоса пользователя */
    asr_sentiment: {
        /** Список характеристик эмоциональной окраски голоса пользователя */
        classes: PhraseEmotions[];
        /** Коэффициенты той или иной эмоциональной характеристики реплики пользователя в диапазоне от 0 до 1 */
        probas: number[];
    };
}

export interface CcyToken {
    value: string;
}

export interface MoneyToken {
    amount: number;
    currency: string;
}

export interface NumToken {
    adjectival_number: boolean;
    value: number;
}

export interface Entities {
    CCY_TOKEN: CcyToken[];
    MONEY_TOKEN: MoneyToken[];
    NUM_TOKEN: NumToken[];
}

export interface GrammemInfo {
    aspect?: string;
    mood?: string;
    number?: string;
    part_of_speech: string;
    person?: string;
    raw_gram_info: string;
    transitivity?: string;
    verbform?: string;
    voice?: string;
    numform?: string;
    degree?: string;
    case?: string;
    gender?: string;
    animacy?: string;
}

export interface TokenValue {
    adjectival_number?: boolean;
    value: number | string;
}

export interface ListOfTokenTypesDatum {
    token_type: string;
    token_value: TokenValue;
}

/** Данные о текущем времени на устройстве пользователя */
export interface Time {
    /** Наименование часового пояса. Пример Europe/Moscow. */
    timezone_id: string;
    timezone_offset_sec: number;
    /**  Unix-время в миллисекундах */
    timestamp: number;
}

export interface AppState {
    [key: string]: unknown;
    item_selector?: {
        ignored_words?: string[];
        /* Список соответствий голосовых команд действиям в веб-приложении */
        items: [
            {
                /* Порядковый номер элемента, назначается смартаппом, уникален в рамках items */
                number?: number;
                /* Уникальный id элемента */
                id?: string;
                /* Ключевая фраза, которая должна приводить к данному действию */
                title?: string;
                /* Фразы-синонимы, которые должны быть расценены как данное действие */
                aliases?: string[];
                /* Сервер экшен, проксирует action обратно на бекэнд. */
                server_action?: unknown;
                /* Экшен, который вернется в AssistantSmartAppData */
                action?: unknown;
                /* Дополнительные данные для бэкенда */
                [key: string]: unknown;
            },
        ];
    };
}

/** Данные о содержимом экрана пользователя */
export interface Meta {
    time: Time;
    current_app: {
        app_info: AppInfo;
        state: AppState;
    };
}

/** Возможные стратегии смартапа */
export interface Strategies {
    /** Сообщает, что у пользователя сегодня день рождения */
    happy_birthday?: boolean;
    /** Время, которое прошло с момента последнего обращения к смартапу */
    last_call?: Date;
    /**
     * Передается только в том случае, когда биометрия определила голос Яндекс Алисы.
     * В остальных случаях поле отсутствует.
     */
    is_alice?: boolean;
}

export interface TokenizedElementsList {
    dependency_type?: string;
    grammem_info?: GrammemInfo;
    head?: number;
    lemma: string;
    list_of_dependents?: number[];
    text: string;
    composite_token_length?: number;
    composite_token_type?: string;
    composite_token_value?: MoneyToken;
    is_beginning_of_composite?: boolean;
    list_of_token_types_data?: ListOfTokenTypesDatum[];
    token_type?: string;
    token_value?: TokenValue;
}

/** Результат предобработки */
export interface Message {
    /**
     * Исходное сообщение пользователя: распознанный голос или введенный текст.
     * В случае распознанного голоса предоставляется текст запроса без нормализации числительных
     * и другого, соответственно, все числа, номера телефонов и тд представлены словами.
     */
    original_text: string;
    /**
     * Нормализованный текст, который ввел пользователь.
     * Можно использовать для снижения многообразия запросов, например, для аналитики.
     */
    normalized_text: string;
    /** Отображаемый на экране текст запроса/нормализованный на этапе ASR запрос */
    asr_normalized_message: string;
    /** Извлеченные из запроса сущности */
    entities: Entities;
    tokenized_elements_list: TokenizedElementsList[];
}

/**
 * Описание элемента экрана, который пользователь назвал при запросе ("включи второй"/"включи второго терминатора").
 * Для работы этой функциональности нужна отправка во входящем сообщении с фронтенда item_selector со списком элементов.
 * Объект передаётся всегда и может быть либо пустым, либо содержать все указанные поля.
 */
export interface SelectedItem {
    /** Номер элемента из списка, начиная с 0 */
    index: number;
    /** Название элемента */
    title: string;
    /** Указывает выбор элемента по номеру */
    is_query_by_number: boolean;
}

export interface NLPRequestBody<T, P> {
    /** Тип запроса */
    messageName: T;

    /**
     * Идентификатор сессии, который обновляется каждый раз, когда в поле new_session приходит true.
     * При использовании совместно с messageId помогает гарантировать уникальность сообщения.
     * В том числе если пользователь взаимодействует с несколькими поверхностями.
     */
    sessionId: string;

    /**
     * Идентификатор запроса, который отправил ассистент.
     * Ответ на запрос должен содержать такой же идентификатор в поле messageId.
     */
    messageId: number;

    uuid: UUID;
    /**
     * Коллекция, в которой в зависимости от потребителя
     * и messageName передается дополнительная информация.
     */
    payload: P;
}

export interface SharedRequestPayload {
    device: Device;
    app_info: AppInfo;
    /** Имя смартапа, которое задается при создании проекта и отображается в каталоге приложений */
    projectName: string;
    strategies?: Strategies;
    character: Character;
}

export interface MTSPayload extends SharedRequestPayload {
    /** Интент, полученный из предыдущего ответа смартапа */
    intent: string;
    /** Исходный интент. Значение поля отличается от значения intent только при монопольном захвате контекста. */
    original_intent: string;
    /** Мета данные, полученные от сервиса распознавания интентов */
    intent_meta: unknown;
    meta: Meta;
    selected_item: SelectedItem;
    /**
     * Указывает на характер запуска смартапа. Если поле содержит true,
     * сессии присваивается новый идентификатор (поле sessionId).
     * true — приложение запущено впервые или после закрытия приложения,
     * а так же при запуске приложения по истечению тайм-аута (10 минут)
     * или после прерывания работы приложения, например, по запросу "текущее время"
     */
    new_session: boolean;
    annotations: Annotations;
    message: Message;
}

/** MESSAGE_TO_SKILL */
export type NLPRequestMTS = NLPRequestBody<NLPRequestType.MESSAGE_TO_SKILL, MTSPayload>;

export interface SAPayload extends SharedRequestPayload {
    app_info: AppInfo;
    server_action?: {
        payload: unknown;
        type: string;
    };
}

/**
 * SERVER_ACTION
 * Вы можете получать информацию о действиях пользователя в приложении, например, нажатии кнопок.
 * Вы также можете отслеживать фоновые действия полноэкранных приложений.
 */
export type NLPRequestSA = NLPRequestBody<NLPRequestType.SERVER_ACTION, SAPayload>;

export interface RAPayload extends SharedRequestPayload {
    /** Интент, который приходит при запуске смартапа */
    intent: 'run_app';
    server_action?: {
        payload: unknown;
        type: string;
    };
}

/** RUN_APP */
export type NLPRequestRA = NLPRequestBody<NLPRequestType.SERVER_ACTION, RAPayload>;

/**
 * CLOSE_APP
 * Когда пользователь произносит команду для остановки приложения,
 * Ассистент передаёт сообщение CLOSE_APP в текущий открытый смартап и закрывает его.
 * Ассистент не ждёт ответа от смартапа. Содержимое сообщения совпадает с содержимым payload сообщения MESSAGE_TO_SKILL.
 */
export type NLPRequestСA = NLPRequestBody<NLPRequestType.SERVER_ACTION, MTSPayload>;

export type NLPRequest = NLPRequestRA | NLPRequestСA | NLPRequestMTS | NLPRequestSA;
