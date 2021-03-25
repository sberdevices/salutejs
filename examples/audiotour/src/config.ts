export default {
    screen: {
        MainPage: 'Screen.MainPage',
        TourPage: 'Screen.TourPage',
        TourStop: 'Screen.TourStop',
    },
    message: {
        PAGE_LOADED: {
            ALL_ON_MAIN_PAGE: 'Это пока все аудиогиды. Скоро появятся новые.',
            TourPage: 'Открываю для вас аудиогид',
        },
        ENTITY_NOT_FOUND: 'Пока нет такого аудиогида',
        TO_MAIN_PAGE: {
            ON_MAIN_PAGE: 'Мы уже на главной',
            CONFIRMATION: 'Вы уверены, что хотите перейти на главную?',
        },
        TO_EXHIBIT_PAGE: {
            CONFIRMATION: 'Вы хотите поставить на паузу?',
        },
        HELLO: 'Антоша Лапушка',
    },
    suggestions: {
        'Screen.MainPage': ['Открой первую экскурсию'],
        'Screen.TourPage': ['Начнем экскурсию', 'Покажи содержание', 'Все экскурсии'],
        'Screen.TourStop': ['Play', 'Пауза', 'Следующая остановка', 'Выйти из прослушивания'],
    },
};
