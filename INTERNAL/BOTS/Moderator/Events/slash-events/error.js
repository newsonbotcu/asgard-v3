module.exports = class {

    constructor(client) {
        this.client = client;
    }

    async run(err) {

        this.client.logger.log(err, "error");

    }
}
