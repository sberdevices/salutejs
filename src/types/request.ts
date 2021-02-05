import { Capabilities, Features, IntentMeta } from './global';

export interface ASRSentiment {
    classes: string[];
    probas: number[];
}

export interface Annotations {
    censor_data: ASRSentiment;
    text_sentiment: ASRSentiment;
    asr_sentiment: ASRSentiment;
}

export interface AppInfo {
    projectId: string;
    applicationId: string;
    appversionId: string;
}

export interface Character {
    id: string;
    name: string;
    gender: string;
    appeal: string;
}

export interface Device {
    platformType: string;
    platformVersion: string;
    surface: string;
    surfaceVersion: string;
    features: Features;
    capabilities: Capabilities;
    additionalInfo: IntentMeta;
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

export type AppInfoType = {
    applicationId: string;
    appversionId: string;
    frontendEndpoint: string;
    frontendType: string;
    projectId: string;
};

export interface Time {
    timezone_id: string;
    timezone_offset_sec: number;
    timestamp: number;
}

export interface Meta {
    current_app: {
        app_info: AppInfoType;
        state: {
            [key: string]: any;
            item_selector?: {
                ignored_words?: string[];
                /* Список соответствий голосовых команд действиям в веб-приложении */
                items: {
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
                };
            };
        };
    };
    time: Time;
}

export interface Strategies {
    happy_birthday: boolean;
    last_call: number;
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

export interface Message {
    original_text: string;
    normalized_text: string;
    asr_normalized_message: string;
    entities: Entities;
    tokenized_elements_list: TokenizedElementsList[];
}

export interface NLPRequest {
    messageName: 'MESSAGE_TO_SKILL' | 'SERVER_ACTION' | 'RUN_APP' | 'CLOSE_APP';
    sessionId: string;
    messageId: number;
    uuid: {
        userChannel: 'B2C';
        sub: string;
        userId: string;
    };
    payload: {
        device: Device;
        app_info: AppInfo;
        character: Character;
        intent: string;
        original_intent: string;
        intent_meta: IntentMeta;
        meta: Meta;
        projectName: string;
        annotations: Annotations;
        strategies: Strategies;
        message: Message;
    };
}
