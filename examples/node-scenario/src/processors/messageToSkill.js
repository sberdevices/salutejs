// common
const { decide, getRestOfMessageText } = require('../decision');

// current logic
const actions = require('../actions');
const { createCommand } = require('../command');
const { createSimpleSuggestions, createPronounceText, createItems } = require('../util');

function messageToSkill({ intent, message, meta }) {

    console.log(message.entities);

    // decide what to do
    const { action, decision } = decide(message, intent, actions);

    console.log('='.repeat(20));
    console.log(action);

    // extract info
    const note = getRestOfMessageText(message, decision);
    console.log(note);

    const command = createCommand(action, note, meta);
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
    messageToSkill,
};

