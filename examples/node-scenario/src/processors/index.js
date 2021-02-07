const { messageToSkill } = require('./messageToSkill');
const { serverAction } = require('./serverAction');

module.exports = {
    MESSAGE_TO_SKILL: messageToSkill,
    SERVER_ACTION: serverAction,
    // TODO what we do here ?
    RUN_UP: () => ({}),
    CLOSE_UP: () => ({}),
};
