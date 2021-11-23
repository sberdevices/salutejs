import { SystemMessage, SystemMessageName, SystemMessagePayload } from './systemMessage';

export type NLPRequestType =
    | Extract<SystemMessageName, 'MESSAGE_TO_SKILL' | 'SERVER_ACTION' | 'RUN_APP' | 'CLOSE_APP'>
    | 'TAKE_PROFILE_DATA';

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

type TakeProfileDataStatuses =
    // SUCCESS
    // Данные существуют и получено клиентское согласие
    | {
          code: 1;
          description: string;
      }
    // EMPTY DATA
    // Данные отсутствуют в профиле
    | {
          code: 100;
          description: string;
      }
    // CLIENT DENIED
    // Клиент отклонил автозаполнение
    | {
          code: 101;
          description: string;
      }
    // FORBIDDEN
    // Запрещенный вызов от смартапа для GET_PROFILE_DATA
    | {
          code: 102;
          description: string;
      }
    // FORBIDDEN REQUEST
    // Запрещенный вызов от смартапа для CHOOSE_PROFILE_DATA и DETAILED_PROFILE_DATA
    // в случае отсутствия клиентского согласия
    | {
          code: 103;
          description: string;
      }
    // Access Denied
    // Запрещенный вызов от смартапа для CHOOSE_PROFILE_DATA и DETAILED_PROFILE_DATA
    // в случае отсутствия прав на изменение или уточнение данных
    | {
          code: 104;
          description: string;
      };

export type NLPRequestTPD = NLPRequestBody<
    Extract<NLPRequestType, 'TAKE_PROFILE_DATA'>,
    SharedRequestPayload & {
        profile_data: {
            customer_name?: string;
            surname?: string;
            patronymic?: string;
            address?: {
                address_string: string;
                address_type: string;
                alias: string;
                comment: string;
                confirmed: boolean;
                country: string;
                city: string;
                district: string;
                location: {
                    latitude: number;
                    longitude: number;
                };
                last_used: boolean;
                apartment: string;
                entrance: string;
                floor: string;
                region: string;
                street: string;
                house: string;
                settlement?: string;
            };
            phone_number?: string;
        };
        status_code: TakeProfileDataStatuses;
    }
>;

export type NLPRequest = NLPRequestRA | NLPRequestСA | NLPRequestMTS | NLPRequestSA | NLPRequestTPD;
