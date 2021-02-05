import { Device } from './global';

export interface Emotion {
    emotionId: string;
}

export interface UUID {
    userChannel: string;
    sub: string;
    userId: string;
}

export interface Command {
    type: 'smart_app_data';
    smart_app_data?: unknown;
    [key: string]: unknown;
}

export interface Bubble {
    text: string;
    markdown?: boolean;
    expand_policy: 'auto_expand' | 'force_expand' | 'preserve_panel_state';
}

export interface Card {
    type: 'grid_card' | 'gallery_card' | 'list_card';
}

export interface TextAction {
    text: string;
    should_send_to_backend: boolean;
    type: 'text';
}

export interface DeepLinkAction {
    type: 'deep_link';
    deep_link: string;
}

export interface ServerAction {
    type: 'server_action';
    message_name?: string;
    server_action: {
        action_id: string;
        [key: string]: unknown;
    };
}

export type Action = TextAction | DeepLinkAction | ServerAction;

export interface NLPResponse {
    messageName: string;
    sessionId: string;
    messageId: number;
    uuid: UUID;
    payload: {
        auto_listening: boolean;
        character?: {
            id: 'sber' | 'eva' | 'joy';
        };
        pronounceText: string;
        emotion?: Emotion;
        items: Array<{
            command?: Command;
            bubble?: Bubble;
            card?: Card;
        }>;
        suggestions?: {
            buttons: { title: string; actions: Action[] }[];
        };
        intent: string;
        projectName: string;
        device: Device;
    };
}
