
const { findItemByText } = require('./items');

function createCommand(action, note, meta) {
    const command = {
        type: "smart_app_data",
        action: {
            type: action.type.toLowerCase(), // because of frontend
        }
    };

    switch (action.type) {
        case 'UNKNOWN':
        case 'START':
            command.action = null;
            break;

        case 'ADD_NOTE':
            command.action.note = note;
            break;

        case 'DELETE_NOTE':
        case 'DONE_NOTE':
            const appState = meta.current_app.state;
            const item = findItemByText(appState, note);

            console.log('*'.repeat(20));
            console.log(item);

            if (item) {
                command.action.id = item.id;
            } else {
                // TODO: такое себе менять тут action
                action.pronounce = () => 'Не знаю какую выбрать';
            }
            break;

    }

    return command;
}

module.exports = {
    createCommand,
};
