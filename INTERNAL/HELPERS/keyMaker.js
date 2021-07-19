const LogData = require('../MODELS/Base/Logger');
const gen = require('shortid');

module.exports = {
    async tryGet() {
        const myKey = gen.generate() + ':' + gen.generate();
        const model = await LogData.findOne({ _id: myKey });
        if (!model) {
            return myKey;
        } else {
            return module.exports.tryGet();
        }
    }
}