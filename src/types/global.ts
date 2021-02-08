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

export interface Features {
    appTypes: string[];
}

export interface Mic {
    available: boolean;
}

export interface Capabilities {
    screen: Mic;
    mic: Mic;
    speak: Mic;
}

export interface IntentMeta {}

/** Операционная система устройства */
export enum OS {
    ANDROID = 'ANDROID',
    IOS = 'IOS',
}

/**
 * Поверхность, от которой приходит вызов ассистента.
 * Например, приложение СберБанк Онлайн или SberBox.
 */
export enum Surface {
    /** Устройство SberBox */
    SBERBOX = 'SBERBOX',
    /** Приложение Сбер Салют */
    COMPANION = 'COMPANION',
    /** Устройство SberPortal */
    STARGATE = 'STARGATE',
}

/** Информация об устройстве пользователя */
export interface Device {
    /** Идентификатор устройства */
    deviceId: string;
    platformType: OS;
    /** Версия операционной системы */
    platformVersion: string;
    surface: Surface;
    /** Версия поверхности */
    surfaceVersion: string;
    features: Features;
    capabilities: Capabilities;
    additionalInfo: IntentMeta;
}

/** Составной идентификатор пользователя */
export interface UUID {
    /** Идентификатор канала коммуникации */
    userChannel: string;
    /**
     * Постоянный идентификатор пользователя созданный на основе SberID.
     * Может отсутствовать, если пользователь не аутентифицирован.
     * Может использовать для хранения контекста диалога пользователя.
     * Контекст диалога можно обновлять по значению поля new_session.
     */
    sub: string;
    /**
     * Идентификатор, который используется для определения не аутентифицированных пользователей.
     * Идентификатор может изменяться при сбросе настроек или переустановке смартапа.
     */
    userId: string;
}
