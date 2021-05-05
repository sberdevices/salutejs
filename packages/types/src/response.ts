import {
    SystemMessage,
    SystemMessageName,
    SystemMessagePayload,
    AssistantCommand,
    BubbleCommand,
    CardCommand,
    PolicyRunAppComand,
} from './systemMessage';

export type NLPResponseType = Extract<
    SystemMessageName,
    'ANSWER_TO_USER' | 'POLICY_RUN_APP' | 'NOTHING_FOUND' | 'ERROR'
>;

export interface NLPResponseBody<T, P> extends Pick<SystemMessage, 'sessionId' | 'messageId' | 'uuid'> {
    /** Тип ответа. Определяет логику обработки. */
    messageName: T;
    /** Объект с данными, которые зависят от типа сообщения */
    payload: P;
}

export type SharedResponsePayload = Pick<SystemMessagePayload, 'projectName' | 'device'>;

export type ATUItemsType = AssistantCommand | BubbleCommand | CardCommand | PolicyRunAppComand;

export interface ATUPayload
    extends SharedResponsePayload,
        Pick<
            SystemMessagePayload,
            | 'auto_listening'
            | 'pronounceText'
            | 'pronounceTextType'
            | 'emotion'
            | 'suggestions'
            | 'intent'
            | 'asr_hints'
        > {
    /** Список команд и элементов интерфейса смартапа */
    items: ATUItemsType[];
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
export type NLPResponseATU = NLPResponseBody<Extract<NLPResponseType, 'ANSWER_TO_USER'>, ATUPayload>;

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
export type NLPResponsePRA = NLPResponseBody<Extract<NLPResponseType, 'POLICY_RUN_APP'>, PRAPayload>;

export interface NFPayload extends SharedResponsePayload {
    /** Интент, который смартап получит в следующем ответе ассистента */
    intent?: string;
}

/** NOTHING_FOUND Response */
export type NLPResponseNF = NLPResponseBody<Extract<NLPResponseType, 'NOTHING_FOUND'>, NFPayload>;

export interface EPayload extends SharedResponsePayload, Pick<SystemMessagePayload, 'description'> {
    /** Код ошибки */
    code: number;
    /** Интент, который смартап получит в следующем ответе ассистента */
    intent?: string;
}

/** ERROR Response */
export type NLPResponseE = NLPResponseBody<Extract<NLPResponseType, 'ERROR'>, EPayload>;

export type NLPResponse = NLPResponseATU | NLPResponseE | NLPResponseNF | NLPResponsePRA;
