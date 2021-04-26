/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Передача текста.
 */
export interface Bubble {
    /**
     * Текст, который отобразит ассистент.
     */
    text: string;
    /**
     * Указывает, что текст содержит маркдаун-разметку, которую необходимо обработать.
     */
    markdown?: boolean;
    /**
     * Поведение шторки ассистента. Параметр актуален при работе с ассистентом на наших устройствах.
     */
    expand_policy?: 'auto_expand' | 'force_expand' | 'preserve_panel_state';
    [k: string]: unknown;
}