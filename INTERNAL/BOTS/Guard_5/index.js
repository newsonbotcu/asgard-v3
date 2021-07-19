require('dotenv').config({ path: __dirname + '/../../../.env' });
const { Intents } = require('discord.js');
const Tantoony = require('./../../BASE/Tantoony');
const client = new Tantoony({
    ws: {
        intents: new Intents(Intents.ALL).remove([
            //"GUILDS",
            "GUILD_MEMBERS",
            "GUILD_BANS",
            "GUILD_EMOJIS",
            "GUILD_INTEGRATIONS",
            "GUILD_WEBHOOKS",
            "GUILD_INVITES",
            "GUILD_VOICE_STATES",
            //"GUILD_PRESENCES",
            "GUILD_MESSAGES",
            "GUILD_MESSAGE_REACTIONS",
            "GUILD_MESSAGE_TYPING",
            "DIRECT_MESSAGES",
            "DIRECT_MESSAGE_REACTIONS",
            "DIRECT_MESSAGE_TYPING"
        ])
    }
});
client.login(process.env.token_database);
client.handler.mongoLogin();
client.handler.events('/../../EVENTS', __dirname);
client.on("error", (e) => client.logger.log(e, "error"));
client.on("warn", (info) => client.logger.log(info, "warn"));
process.on("unhandledRejection", (err) => client.logger.log(err, "caution"));
process.on("warning", (warn) => client.logger.log(warn, "varn"));
process.on("beforeExit", () => console.log('Bitiriliyor...'));
client.handler.softEvents('/Events', __dirname);