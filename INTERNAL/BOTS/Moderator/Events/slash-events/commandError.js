module.exports = class {

    constructor(client) {
        this.client = client;
    }

    async run(command, err, ctx) {

        this.client.logger.log(`[${command.commandName}]: ${err}`)

    }
}
