const actions = require('../actions');
const { createCommand } = require('../command');
const { createSimpleSuggestions, createPronounceText, createItems } = require('../util');

function serverAction(payload) {
    console.log('server action!!!', JSON.stringify(payload.server_action));

    const { action_id, parameters } = payload.server_action || {};

    const note = parameters.title;
    const action = actions[action_id] || actions[`${action_id.toUpperCase()}_NOTE`];

    const command = createCommand(action, note, payload.meta);
    const items = createItems(command);

    const pronounceText = createPronounceText(action, note);
    const suggestions = createSimpleSuggestions(action);

    return {
        items,
        pronounceText,
        suggestions,
    };
}

module.exports = {
    serverAction,
};
