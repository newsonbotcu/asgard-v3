module.exports = class {

    constructor(client) {
        this.client = client;
    }

    async run(command) {

        this.client.logger.log(`Unregistered Command: ${command.opts.commandName}`, "unload");

    }
}
