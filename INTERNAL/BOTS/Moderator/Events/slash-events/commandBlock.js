module.exports = class {

    constructor(client) {
        this.client = client;
    }

    async run(command, ctx, reason, data) {

        this.client.logger.log(`[BLOCKED] ${command.commandName} , ${reason}`);

    }
}
