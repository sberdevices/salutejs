import { Device, UUID } from './global';
import { NLPRequestBody } from './request';
import { Bubble } from './bubble';
import { Card } from './card';

export enum NLPResponseType {
    /** Содержит ответ, который ассистент предоставит пользователю */
    ANSWER_TO_USER = 'ANSWER_TO_USER',
    /** Сообщает, что смартап хочет запустить другое приложение */
    POLICY_RUN_APP = 'POLICY_RUN_APP',
    /** Смартап не смог найти ответ. Может указывать на то, что приложение было запущено по ошибке. */
    NOTHING_FOUND = 'NOTHING_FOUND',
    /**
     * Cообщает ассистенту, что в смартапе возникла ошибка.
     * Ассистент самостоятельно сообщит пользователю о возникнокении ошибки.
     */
    ERROR = 'ERROR',
}

/** Команда для передачи данных в Canvas App */
export interface DataCommand {
    type: 'smart_app_data';
    /** Валидный JSON-объект с произвольными данными для смартапа */
    smart_app_data?: unknown;
}

/** Команда для прокидывания ошибки в Canvas App */
export interface ErrorCommand {
    type: 'smart_app_error';
    smart_app_error: {
        code: number;
        description: string;
    };
}

/** Действие, которое обозначает отправку сообщения от имени пользователя в чат с ассистентом */
export interface TextAction {
    type: 'text';
    /** Текст сообщения от имени пользователя */
    text: string;
    /** Указывает, что сообщение нужно не только отобразить в чате с ассистентом, но и отправить в бэкенд */
    should_send_to_backend: boolean;
}

/** Действие, которое обозначает обработку диплинка ассистентом или хост-приложением */
export interface DeepLinkAction {
    type: 'deep_link';
    /**
     * Диплинк, который нужно открыть.
     * Работает только при вызове смартапа в мобильном приложении и в SberPortal.
     */
    deep_link: string;
}

/**  Произвольное сообщение для смартапа */
export interface ServerAction {
    type: 'server_action';
    message_name?: string;
    /** Сообщение для бэкенда */
    server_action: {
        /** Произвольное название действия */
        action_id: string;
        [key: string]: unknown;
    };
}

export interface ActionCommand {
    type: 'action';
    action: TextAction | DeepLinkAction | ServerAction;
}

/** Закрытие смартапа */
export interface CloseAppCommand {
    type: 'close_app';
}

export type UserPermisson = 'geo' | 'read_contacts' | 'record_audio' | 'push';

/** Запрос разрешений на получение и обработку данных пользователя */
export interface PermissionCommand {
    type: 'request_permissions';
    permissions: UserPermisson[];
}

/** Команда для получения инвойса платежа */
export interface InvoiceCommand {
    type: 'payment_invoice';
    payment_invoice: {
        /** Идентификатор инвойса */
        invoice_id: string;
    };
}

export interface AssistantCommand {
    command: DataCommand | ActionCommand | CloseAppCommand | PermissionCommand | InvoiceCommand | ErrorCommand;
}

export interface BubbleCommand {
    bubble: Bubble;
}

export interface CardCommand {
    card: Card;
}

export interface PolicyRunAppComand {
    command: 'POLICY_RUN_APP';
    nodes: {
        server_action: {
            app_info: {
                systemName: string;
            };
            parameters: Record<string, unknown>;
        };
    };
}

/**
 * Доступные id контекстов для поиска.
 * Например, если задать для какого-то контекста префиксы ("позвони", "набери"),
 * то ASR будет искать в этом контексте только, если встретит слова "позвони" или "набери".
 * Если задать пустой набор префиксов, то ASR будет искать в этом контексте в любом случае.
 * Таким образом, если мы хотим, чтобы поиск происходил по всем дефолтным префиксам,
 * для значений идентификаторов контекста context_id (mobile_contacts, vk_contacts, vk.fiends)
 * префиксы указывать необязательно.
 */
export type ASRContextsId = 'mobile_contacts' | 'vk_contacts' | 'vk.fiends';

/** Подсказки для сервиса синтеза и распознавания речи */
export interface ASRHints {
    /** Позволяет использовать список слов или фраз, не хранящихся в ASR, для одноразового определения контекста */
    words?: string[];
    /** Позволяет включить опцию обработки коротких слов и букв, которые по умолчанию блокируются ASR */
    enable_letters?: boolean;
    /**
     * Меняет интервал ожидания речи пользователя.
     * Возможные значения от 2 до 20 секунд.
     */
    nospeechtimeout?: number;
    /**
     * Позволяет выбирать модель распознавания речи в запросе.
     * Если передаётся валидная модель (media или general), то в запросе она может быть изменена.
     * Модель media распознаёт русский и английский языки.
     * Модель general использует только русский язык.
     */
    model?: 'media' | 'general';
    contexts?: ASRContextsId[];
}

/** Эмоция ассистента, которую он показывает с помощью анимации кнопки */
export enum EmotionType {
    /** Анимация игривости, которую ассистент может испытывать в ответ на дружеские шутки и подколки пользователя */
    igrivost = 'igrivost',
    /** Анимация удовольствия */
    udovolstvie = 'udovolstvie',
    /** Анимация подавляемого раздражения на отрицательно окрашенные реплики в адрес ассистента */
    podavleniye_gneva = 'podavleniye_gneva',
    /** Анимация смущения, например, в ответ на похвалу */
    smushchennaya_ulibka = 'smushchennaya_ulibka',
    /** Анимация симпатии в ответ на положительно окрашенные реплики */
    simpatiya = 'simpatiya',
    /** Анимация неловкости в ответ на лёгкое раздражение или неудобные вопросы пользователя. */
    oups = 'oups',
    /** Анимация смеха над шуткой пользователя */
    laugh = 'laugh',
    /** Анимация исполнения запроса */
    ok_prinyato = 'ok_prinyato',
    /** Анимация беспокойства, например, при жалобе пользователя на самочувствие */
    bespokoistvo = 'bespokoistvo',
    /** Анимация возбуждённого ожидания следующей реплики пользователя */
    predvkusheniye = 'predvkusheniye',
    /** Анимация вины, например, если в приложении произошла ошибка */
    vinovatiy = 'vinovatiy',
    /** Анимация ожидания реакции от пользователя, например, ответа на заданный вопрос */
    zhdu_otvet = 'zhdu_otvet',
    /** Анимация размышление над репликой пользователя, например, если её не удалось распознать */
    zadumalsa = 'zadumalsa',
    /** Анимация отсутствия ответа */
    neznayu = 'neznayu',
    /** Анимация сомнения, например, когда не удаётся точно распосзнать реплику */
    nedoumenie = 'nedoumenie',
    /** Анимация негативной рекакции в ответ на реплику */
    nedovolstvo = 'nedovolstvo',
    /** Анимация несогласия с пользователем */
    nesoglasie = 'nesoglasie',
    /** Анимация грусти и тоскливого настроения */
    pechal = 'pechal',
    /** Анимация радости или удовлетворения действиями или репликами пользователя */
    radost = 'radost',
    /** Анимация сопереживания или выражения участия в проблемах пользователя */
    sochuvstvie = 'sochuvstvie',
    /** Анимация испуга */
    strakh = 'strakh',
    /** Анимация проявления интереса или любопытства по отношению к действиям или репликам пользователя */
    zainteresovannost = 'zainteresovannost',
}

export interface NLPResponseBody<T, P> {
    /** Тип ответа. Определяет логику обработки. */
    messageName: T;
    /**
     * Идентификатор сессии, который обновляется каждый раз, когда в поле new_session приходит true.
     * При использовании совместно с messageId помогает гарантировать уникальность сообщения.
     * В том числе если пользователь взаимодействует с несколькими поверхностями.
     */
    sessionId: string;
    /** Идентификатор ответа смартапа. Должен быть таким же, как идентификатор запроса. */
    messageId: number;
    uuid: UUID;
    /** Объект с данными, которые зависят от типа сообщения */
    payload: P;
}

export type ATUItemsType = AssistantCommand | BubbleCommand | CardCommand | PolicyRunAppComand;

export interface Button {
    /** Название кнопки, которое отображается в интерфейсе ассистента */
    title: string;
    /** Описывает действие, которое выполнится по нажатию кнопки */
    action?: TextAction | DeepLinkAction | ServerAction;
    /** Массив, содержащий несколько действий, которые выполнятся по нажатию кнопки */
    actions?: Array<TextAction | DeepLinkAction | ServerAction>;
}

export interface SharedResponsePayload {
    /** Имя смартапа, которое задается при создании проекта и отображается в каталоге приложений */
    projectName: string;
    device: Device;
}

export interface ATUPayload extends SharedResponsePayload {
    /** Указывает, что ассистент должен слушать пользователя после выполнения действия */
    auto_listening?: boolean;
    /** Текст, который ассистент озвучит пользователю */
    pronounceText?: string;
    /** Указывает, что в тексте, который необходимо озвучить (поле pronounceText) */
    pronounceTextType?: 'application/text' | 'application/ssml';
    emotion?: {
        emotionId: EmotionType;
    };
    /** Список команд и элементов интерфейса смартапа */
    items: ATUItemsType[];
    /**
     * Предложения, которые смартап может сделать пользователю в зависимости от контекста диалога.
     * Предложения могут быть представлены в виде кнопок и карточек.
     * Важно! В интерфейсе SberBox предложения носят информационный характер.
     * Оформляйте их в виде подсказок, а не кнопок.
     */
    suggestions?: {
        /** Список кнопок с предложениями смартапа. Каждая кнопка представлена в виде отдельного объекта. */
        buttons: Button[];
    };
    /** Интент, который смартап получит в следующем ответе ассистента */
    intent: string;
    asr_hints?: ASRHints;
    /**
     * Сообщает ассистенту о завершении работы смартапа.
     * В приложениях типа Canvas App необходимо самостоятельно закрывать окно приложения
     * после завершения работы смартапа. Для этого требуется передать ассистенту команду close_app
     * с помощью метода assistant.close() или window.AssistantHost.close(),
     * если вы не используете Assistant Client.
     */
    finished: boolean;
}

/** ANSWER_TO_USER Response */
export type NLPResponseATU = NLPRequestBody<NLPResponseType.ANSWER_TO_USER, ATUPayload>;

export interface PRAPayload extends SharedResponsePayload {
    server_action: {
        app_info:
            | {
                  systemName: string;
              }
            | {
                  projectId: string;
              };
        parameters?: Record<string, unknown>;
    };
}

/** POLICY_RUN_APP Response */
export type NLPResponsePRA = NLPRequestBody<NLPResponseType.POLICY_RUN_APP, PRAPayload>;

export interface NFPayload extends SharedResponsePayload {
    /** Интент, который смартап получит в следующем ответе ассистента */
    intent?: string;
}

/** NOTHING_FOUND Response */
export type NLPResponseNF = NLPRequestBody<NLPResponseType.NOTHING_FOUND, NFPayload>;

export interface EPayload extends SharedResponsePayload {
    /** Код ошибки */
    code: number;
    /** Описание ошибки */
    description?: string;
    /** Интент, который смартап получит в следующем ответе ассистента */
    intent?: string;
}

/** ERROR Response */
export type NLPResponseE = NLPRequestBody<NLPResponseType.ERROR, EPayload>;

export type NLPResponse = NLPResponseATU | NLPResponseE | NLPResponseNF | NLPResponsePRA;
