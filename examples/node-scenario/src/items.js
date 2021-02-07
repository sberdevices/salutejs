
const ss = require('string-similarity');

function findItemByText(state, text) {

    const { items = [] } = state.item_selector || {};

    const found = ss.findBestMatch(text.toLowerCase(), items.map(item => item.title.toLowerCase()));

    if (found.bestMatch.rating > 0.7) {
        return items[found.bestMatchIndex];
    }

    return null;
}

module.exports = {
    findItemByText,
};
