const LogModel = require('../MODELS/Base/Logger');
const keyGetter = require('../HELPERS/keyMaker');

class JailEvent {
    constructor(client) {
        this.client = client;
    };
    async run(type, userID, action, des) {
        const keyID = await keyGetter.tryGet();
        await LogModel.create({
            _id: keyID,
            type: type,
            userID: userID,
            action: action,
            description: des,
            created: new Date()
        });
    }
}

module.exports = JailEvent;