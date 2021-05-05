import { SystemMessage, SystemMessageName, SystemMessagePayload } from './systemMessage';

export type NLPRequestType = Extract<SystemMessageName, 'MESSAGE_TO_SKILL' | 'SERVER_ACTION' | 'RUN_APP' | 'CLOSE_APP'>;

export interface NLPRequestBody<T, P> extends Pick<SystemMessage, 'sessionId' | 'messageId' | 'uuid'> {
    /** Тип запроса */
    messageName: T;
    /**
     * Коллекция, в которой в зависимости от потребителя
     * и messageName передается дополнительная информация.
     */
    payload: P;
}

export type SharedRequestPayload = Pick<
    SystemMessagePayload,
    'device' | 'app_info' | 'projectName' | 'strategies' | 'character'
>;

export type MTSPayload = SharedRequestPayload &
    Pick<
        SystemMessagePayload,
        | 'intent'
        | 'original_intent'
        | 'intent_meta'
        | 'meta'
        | 'selected_item'
        | 'new_session'
        | 'annotations'
        | 'message'
    >;

/** MESSAGE_TO_SKILL */
export type NLPRequestMTS = NLPRequestBody<Extract<NLPRequestType, 'MESSAGE_TO_SKILL'>, MTSPayload>;

export interface SAPayload extends SharedRequestPayload, Pick<SystemMessagePayload, 'app_info'> {
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
export type NLPRequestSA = NLPRequestBody<Extract<NLPRequestType, 'SERVER_ACTION'>, SAPayload>;

export interface RAPayload extends SharedRequestPayload {
    /** Интент, который приходит при запуске смартапа */
    intent: 'run_app';
    server_action?: {
        payload: unknown;
        type: string;
    };
}

/** RUN_APP */
export type NLPRequestRA = NLPRequestBody<Extract<NLPRequestType, 'RUN_APP'>, RAPayload>;

/**
 * CLOSE_APP
 * Когда пользователь произносит команду для остановки приложения,
 * Ассистент передаёт сообщение CLOSE_APP в текущий открытый смартап и закрывает его.
 * Ассистент не ждёт ответа от смартапа. Содержимое сообщения совпадает с содержимым payload сообщения MESSAGE_TO_SKILL.
 */
export type NLPRequestСA = NLPRequestBody<Extract<NLPRequestType, 'CLOSE_APP'>, MTSPayload>;

export type NLPRequest = NLPRequestRA | NLPRequestСA | NLPRequestMTS | NLPRequestSA;
