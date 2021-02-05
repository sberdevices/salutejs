import { NLPRequest, NLPResponse } from '../../src';

export const handlePhrase = (request: NLPRequest, response: NLPResponse): void => {
    if (request.payload.message.original_text === 'Запусти напоминалку') {
        response.payload.items = [{ bubble: { text: 'Погнали', expand_policy: 'auto_expand' } }];
    } else if (request.payload.message.original_text === 'Напомни купить молоко') {
        response.payload.items = [
            {
                bubble: { text: 'Добавлено', expand_policy: 'auto_expand' },
                command: { type: 'smart_app_data', action: { type: 'add_note', note: 'Купить молоко' } },
            },
        ];
        response.payload.suggestions = {
            buttons: [
                {
                    title: 'Запиши купить хлеб',
                    actions: [{ type: 'text', text: 'Запиши купить хлеб', should_send_to_backend: true }],
                },
                {
                    title: 'Добавь запись помыть машину',
                    actions: [{ type: 'text', text: 'Добавь запись помыть машину', should_send_to_backend: true }],
                },
            ],
        };
    } else if (request.payload.message.original_text === 'Удали купить молоко') {
        // id из request.payload.meta.current_app.state.item_selector.items
        response.payload.items = [
            {
                bubble: { text: 'Удалено', expand_policy: 'auto_expand' },
                command: { type: 'smart_app_data', action: { type: 'delete_note', id: '123' } },
            },
        ];
    } else if (request.payload.message.original_text === 'Сделано купить молоко') {
        // id из request.payload.meta.current_app.state.item_selector.items
        response.payload.items = [
            {
                bubble: { text: 'Молодец', expand_policy: 'auto_expand' },
                command: { type: 'smart_app_data', action: { type: 'done_note', id: '123' } },
            },
        ];
        response.payload.suggestions = {
            buttons: [
                {
                    title: 'Запиши купить хлеб',
                    actions: [{ type: 'text', text: 'Запиши купить хлеб', should_send_to_backend: true }],
                },
                {
                    title: 'Добавь запись помыть машину',
                    actions: [{ type: 'text', text: 'Добавь запись помыть машину', should_send_to_backend: true }],
                },
            ],
        };
    } else {
        response.payload.items = [{ bubble: { text: 'Я не понимаю', expand_policy: 'auto_expand' } }];
    }
};
