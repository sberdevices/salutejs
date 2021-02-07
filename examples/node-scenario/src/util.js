

function createSimpleSuggestions(action) {
    return action.suggestions && {
        buttons: action.suggestions().map(title => ({
            title,
            action: {
                text: title
            }
        })),
    };
}

function createPronounceText(action, text) {
    return action.pronounce && action.pronounce({ text });
}

function createItems(command) {
    const items = [];

    if (command.action) {
        items.push({ command });
    }

    return items;
}

module.exports = {
    createSimpleSuggestions,
    createPronounceText,
    createItems,
};
