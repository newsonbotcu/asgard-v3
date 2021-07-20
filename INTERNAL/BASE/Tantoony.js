const { Client, Collection } = require('discord.js');
const FileSync = require('lowdb/adapters/FileSync');
const events = require('events');
class Tantoony extends Client {
    constructor(options) {
        super(options);

        this.config = require('../HELPERS/config');
        this.logger = require("../HELPERS/logger");
        this.functions = require("../HELPERS/functions");
        this.adapters = file => new FileSync(`../../BASE/_${file}.json`);
        
        this.models = new Collection();
        this.commands = new Collection();
        this.aliases = new Collection();
        this.cmdCoodown = new Object();
        this.buttons = new Collection();

        this.leaves = new Map();
        this.deleteChnl = new Map();
        this.invites = new Object();
        this.spamwait = new Map();
        this.spamcounts = new Object();
        this.trollwait = new Object();
        this.trollcounts = new Object();
        this.stats = new Object();
        this.banlimit = new Object();
        this.voicecutLimit = new Object();

        this.handler = new (require('../HELPERS/initialize'))(this);
        this.extention = new events.EventEmitter();
    };

    getPath(obj, value, path) {

        if (typeof obj !== 'object') {
            return;
        }

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                var t = path;
                var v = obj[key];
                if (!path) {
                    path = key;
                }
                else {
                    path = path + '.' + key;
                }
                if (v === value) {
                    return path.toString();
                }
                else if (typeof v !== 'object') {
                    path = t;
                };
                var res = this.getPath(v, value, path);
                if (res) {
                    return res;
                }
            }
        };
    }

    async loadSlash(dirname, cmd, creator) {
        try {
            if (!creator.commands.has('global:' + cmd.split('.')[0])) {
                this.logger.log(`Loading Command: ${cmd}. 🔗`, "load");
                await creator.registerCommand(require(`../BOTS/Moderator/Commands/slash-commands/${dirname}/${cmd}`));
                await creator.syncCommands({
                    deleteCommands: true,
                    skipGuildErrors: false,
                    syncGuilds: true,
                    syncPermissions: true
                });
            } else {
                await creator.unregisterCommand(require(`../BOTS/Moderator/Commands/slash-commands/${dirname}/${cmd}`));
                await creator.syncCommands({
                    deleteCommands: true,
                    skipGuildErrors: false,
                    syncGuilds: true,
                    syncPermissions: true
                });
                this.logger.log(`Loading Command: ${cmd}. ⌛`, "load");
                await creator.registerCommand(require(`../BOTS/Moderator/Commands/slash-commands/${dirname}/${cmd}`));
                await creator.syncCommands({
                    deleteCommands: true,
                    skipGuildErrors: false,
                    syncGuilds: true,
                    syncPermissions: true
                });
            }
            return false;
        } catch (e) {
            return `Unable to load command ${cmd}: ${e}`;
        }
    }

    loadCommand(commandPath, commandName) {
        try {
            const props = new (require(`../BOTS/Moderator/${commandPath}/${commandName}`))(this);
            this.logger.log(`Loading Command: ${props.info.name}. 👌`, "load");
            props.config.location = commandPath;
            if (props.init) {
                props.init(this);
            }
            this.commands.set(props.info.name, props);
            props.info.aliases.forEach((alias) => {
                this.aliases.set(alias, props.info.name);
            });
            return false;
        } catch (e) {
            return `Unable to load command ${commandName}: ${e}`;
        }
    }

    async unloadCommand(commandPath, commandName) {
        let command;
        if (this.commands.has(commandName)) {
            command = this.commands.get(commandName);
        } else if (this.aliases.has(commandName)) {
            command = this.commands.get(this.aliases.get(commandName));
        }
        if (!command) {
            return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
        }
        if (command.shutdown) {
            await command.shutdown(this);
        }
        delete require.cache[require.resolve(`../BOTS/Moderator/${commandPath}/${commandName}.js`)];
        return false;
    }

    loadButton(commandPath, commandName) {
        try {
            const props = new (require(`../BOTS/Moderator/${commandPath}/${commandName}`))(this);
            this.logger.log(`Loading Button: ${props.info.name}. 👌`, "load");
            props.config.location = commandPath;
            if (props.init) {
                props.init(this);
            }
            this.buttons.set(props.info.name, props);
            return false;
        } catch (e) {
            return `Unable to load button ${commandName}: ${e}`;
        }
    }

    async unloadButton(commandPath, commandName) {
        let command;
        if (this.buttons.has(commandName)) {
            command = this.buttons.get(commandName);
        }
        if (!command) {
            return `The button \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
        }
        if (command.shutdown) {
            await command.shutdown(this);
        }
        delete require.cache[require.resolve(`../BOTS/Moderator/${commandPath}/${commandName}.js`)];
        return false;
    }
}
module.exports = Tantoony;
