import { Device } from './global';

export interface NLPResponse {
  messageName: string;
  sessionId: string;
  messageId: number;
  uuid: UUID;
  payload: {
    pronounceText: string;
    emotion: Emotion;
    items: Array<{
      command: {
        type: 'smart_app_data';
        smart_app_data: unknown;
      };
    }>;
    intent: string;
    projectName: string;
    device: Device;
  };
}

export interface Emotion {
  emotionId: string;
}

export interface UUID {
  userChannel: string;
  sub: string;
  userId: string;
}
