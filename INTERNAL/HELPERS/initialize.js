const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);

class Initialize {
    constructor(client) {
        this.client = client;
    }

    async events(filePath, dirname, subdir, creator) {
        const evtFiles = subdir ? await readdir(dirname + filePath + `/${subdir}/`) : await readdir(dirname + filePath + '/');
        this.client.logger.log(`Loading a total of ${evtFiles.length} events.`, "category");
        if (!subdir) subdir = 'common';
        evtFiles.forEach((file) => {
            const eventName = file.split(".")[0];
            this.client.logger.log(`Loading Event: ${eventName}`, "load");
            const event = subdir !== 'common' ? new (require(dirname + filePath + `/${subdir}/${file}`))(this.client) : new (require(dirname + filePath + `/${file}`))(this.client);
            if (subdir === 'common') {
                this.client.extention.on(eventName, (...args) => event.run(...args));
                delete require.cache[require.resolve(dirname + filePath + `/${file}`)];
            } else {
                if (subdir === 'slash-events') creator.on(eventName, (...args) => event.run(...args));
                if (subdir === 'client-events') this.client.on(eventName, (...args) => event.run(...args));
                delete require.cache[require.resolve(dirname + filePath + `/${subdir}/${file}`)];
            }
        })
    };

    async softEvents(filePath, dirname) {
        const evtFiles = await readdir(dirname + filePath + "/");
        this.client.logger.log(`Loading a total of ${evtFiles.length} events.`, "category");
        evtFiles.forEach((file) => {
            const eventName = file.split(".")[0];
            this.client.logger.log(`Loading Event: ${eventName}`, "load");
            const event = new (require(dirname + filePath + `/${file}`))(this.client);
            this.client.on(eventName, (...args) => event.run(...args));
            delete require.cache[require.resolve(dirname + filePath + `/${file}`)];
        })
    };

    async hardEvents(filePath, dirname) {
        let eventFolders = await readdir(dirname + filePath + "/");
        this.client.logger.log(`Loading a total of ${eventFolders.length} categories.`, "category");
        eventFolders.filter(dir => dir !== 'other').forEach(async (dir) => {
            let events = await readdir(dirname + filePath + "/" + dir + "/");
            events.filter((evnt) => evnt.split(".").pop() === "js").forEach((file) => {
                this.client.logger.log("loading event: " + file, "load");
                const event = new (require(`${dirname}/${filePath}/${dir}/${file}`))(this.client);
                this.client.on(dir, (...args) => event.run(...args));
                delete require.cache[require.resolve(`${dirname}/${filePath}/${dir}/${file}`)];
            });
        });
    }

    async dotCommands(path) {
        let directories = await readdir(path);
        this.client.logger.log(`Loading a total of ${directories.length} categories.`, "category");
        await directories.forEach((dir) => {
            readdir(path + dir + "/").then((commands) => {
                commands.filter((cmd) => cmd.split(".").pop() === "js").forEach((cmd) => {
                    const response = this.client.loadCommand(path + dir, cmd);
                    if (response) {
                        this.client.logger.log(response, "error");
                    }
                });
            });
        });
    };
    
    async buttons(path) {
        let directories = await readdir(path);
        this.client.logger.log(`Loading a total of ${directories.length} categories.`, "category");
        await directories.forEach((dir) => {
            readdir(path + dir + "/").then((buttons) => {
                buttons.filter((btn) => btn.split(".").pop() === "js").forEach((btn) => {
                    const response = this.client.loadButton(path + dir, btn);
                    if (response) {
                        this.client.logger.log(response, "error");
                    }
                });
            });
        });
    };

    async slashCommands(path, creator) {
        let directories = await readdir(path);
        this.client.logger.log(`Loading a total of ${directories.length} categories.`, "category");
        await directories.forEach(async (dir) => {
            await readdir(path + dir + "/").then(async (commands) => {
                await commands.filter((cmd) => cmd.split(".").pop() === "js").forEach(async (cmd) => {
                    const response = await this.client.loadSlash(dir, cmd, creator);
                    if (response) {
                        this.client.logger.log(response, "error");
                    }
                });
            });
        });
        await creator.syncCommands({
            deleteCommands: true,
            skipGuildErrors: true,
            syncGuilds: true,
            syncPermissions: true
        });
        await creator.syncCommandPermissions();
    };

    mongoLogin() {
        require('mongoose').createConnection(`mongodb://${process.env.ipadress}:27017`, {
            auth: {
                user: this.client.config.username,
                password: process.env.mongoDB
            },
            dbName: this.client.config.mongoDB,
            authSource: this.client.config.auth,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        }).then((connection) => {
            this.client.connection = connection;
            this.client.logger.log("Connected to the Mongodb database.", "mngdb");
        }).catch((err) => {
            this.client.logger.log("Unable to connect to the Mongodb database. Error: " + err, "error");
        });
    }

}

module.exports = Initialize;
