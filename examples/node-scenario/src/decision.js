
const ss = require('string-similarity');

// https://memegenerator.net/img/instances/81851029/i-know-nlp.jpg

function decide(message, intent, actions) {

    // TODO: what is head in tokens ???
    // how we could extract command from text ??
    const decision = { target: null, rating: 0, ix: 0 };

    if (intent === 'run_app' && actions.START) {
        return {
            action: actions.START,
            decision,
        };
    }


    const { original_text, normalized_text, tokenized_elements_list, original_message_name } = message;

    const tokens = tokenized_elements_list;
    const actionsArr = Object.values(actions);

    const matchers = actionsArr.reduce((acc, action) => {
        acc.push(...action.matchers || []);
        return acc;
    }, []);

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.token_type === 'SENTENCE_ENDPOINT_TOKEN') {
            break;
        }

        const found = ss.findBestMatch(token.lemma, matchers);
        const { bestMatch } = found;

        console.log(token, found);

        if (bestMatch.rating > 0.5 && decision.rating < bestMatch.rating) {
            decision.target = bestMatch.target;
            decision.rating = bestMatch.rating;
            decision.ix = i;
        }
    }

    console.log(decision);

    if (decision.target === null) {
        return {
            action: actions.UNKNOWN,
            decision,
        }
    }

    return {
        action: actionsArr.find(action => {
            return action.matchers.some(matcher => matcher === decision.target);
        }),
        decision,
    };
}

function getRestOfMessageText(message, decision) {
    const { original_text } = message;

    console.log(original_text);

    if (decision.target === null) {
        return original_text;
    }

    const res = [];
    const words = original_text.split(' ');

    for (let i = 0; i < words.length; i++) {
        if (decision.ix >= i) {
            continue;
        }

        const word = words[i];

        if (decision.ix + 1 === i) {
            // First word should have upperCase Letter
            res.push(word.substr(0, 1).toUpperCase() + word.substr(1));
        } else {
            res.push(word);
        }
    }

    return res.join(' ');
}

module.exports = {
    decide,
    getRestOfMessageText,
}

