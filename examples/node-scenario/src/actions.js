
    /*
            q!: (~добавить|~установить|запиши|поставь|закинь|~напомнить)
                [~напоминание|~заметка|~задание|~задача]
                $AnyText::anyText

    */
    const ADD_NOTE = {
        type: 'ADD_NOTE',
        matchers: [
            'добавить',
            'установить',
            // 'запиши',
            'записать',
            'поставь',
            'закинь',
            'напомнить',
            'напоминание',
            'заметка',
            'задание',
            'задача'
        ],
        pronounce: () => {
            const answers = [
                'Добавлено!',
                'Сохранено!',
                'Записано!',
            ];

            const rand = answers[Math.floor(Math.random() * answers.length)];

            return `${rand}`;
        },
        suggestions: () => {
            return [
                "Запиши купить молоко",
                "Добавь запись помыть машину",
            ];
        },
    };

    /*
            q!: (~удалить|удали) номер
            @duckling.number:: digit
            $weight<1.001>

            q!: (~удалить|удали)
            $AnyText::anyText
            $weight<-0.8>
    */
    const DELETE_NOTE = {
        type: 'DELETE_NOTE',
        matchers: [
            'удалить',
        ],
        pronounce: ({ text }) => {
            return `Удалил задачу: ${text}`;
        },
        suggestions: () => {
            return [
                "Добавь запись выбросить мусор",
            ];
        },
    };

    /*
            q!: [я] (выполнил|сделал) номер
            @duckling.number:: digit
            $weight<1.001>

            q!: [я] (выполнил|сделал)
            $AnyText::anyText
            $weight<-0.8>

    */
    const DONE_NOTE = {
        type: 'DONE_NOTE',
        matchers: [
            'выполнить',
            'сделать',
        ],
        pronounce: ({ note }) => {
            const answers = [
                'Молодец!',
                'Красавичк!',
                'Супер',
            ];

            const rand = answers[Math.floor(Math.random() * answers.length)];

            return `${rand}`;
        },
        suggestions: () => {
            return [
                "Запиши купить молоко",
                "Добавь запись помыть машину",
            ];
        },
    };

    const UNKNOWN = {
        type: 'UNKNOWN',
        matchers: [],
        // pronounce: 'Я не понимаю',
        pronounce: () => 'Не знаю что и делать',
        suggestions: () => {
            return [
                "Запиши купить молоко",
                "Добавь запись помыть машину",
            ];
        },
    };

    const START = {
        type: 'START',
        intent: 'run_app',
        matchers: [],
        // pronounce: 'Я не понимаю',
        pronounce: () => 'Начнем',
        suggestions: () => {
            return [
                "Запиши купить молоко",
                "Добавь запись помыть машину",
            ];
        },
    };

module.exports = {
    ADD_NOTE,
    DELETE_NOTE,
    DONE_NOTE,
    UNKNOWN,
    START,
};
