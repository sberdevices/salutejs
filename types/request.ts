import { Capabilities, Features, IntentMeta } from './global';

export interface NLPRequest {
  messageName: "MESSAGE_TO_SKILL" | "SERVER_ACTION" | "RUN_APP" | "CLOSE_APP";
  sessionId: string;
  messageId: number;
  uuid: {
    userChannel: "B2C";
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

export interface Annotations {
  censor_data: ASRSentiment;
  text_sentiment: ASRSentiment;
  asr_sentiment: ASRSentiment;
}

export interface ASRSentiment {
  classes: string[];
  probas: number[];
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

export interface Message {
  original_text: string;
  normalized_text: string;
  asr_normalized_message: string;
  entities: Entities;
  tokenized_elements_list: TokenizedElementsList[];
}

export interface Entities {
  CCY_TOKEN: CcyToken[];
  MONEY_TOKEN: MoneyToken[];
  NUM_TOKEN: NumToken[];
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

export interface ListOfTokenTypesDatum {
  token_type: string;
  token_value: TokenValue;
}

export interface TokenValue {
  adjectival_number?: boolean;
  value: number | string;
}

export interface Meta {
  time: Time;
}

export interface Time {
  timezone_id: string;
  timezone_offset_sec: number;
  timestamp: number;
}

export interface Strategies {
  happy_birthday: boolean;
  last_call: number;
}
