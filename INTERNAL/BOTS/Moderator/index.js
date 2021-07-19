require('dotenv').config({ path: __dirname + '/../../../.env' });
const { Intents } = require('discord.js');
const Tantoony = require('./../../BASE/Tantoony');
const client = new Tantoony({
    ws: {
        intents: new Intents(Intents.ALL).remove([
            //"GUILDS",
            //"GUILD_MEMBERS",
            "GUILD_BANS",
            "GUILD_EMOJIS",
            //"GUILD_INTEGRATIONS",
            "GUILD_WEBHOOKS",
            "GUILD_INVITES",
            //"GUILD_VOICE_STATES",
            //"GUILD_PRESENCES",
            //"GUILD_MESSAGES",
            //"GUILD_MESSAGE_REACTIONS",
            "GUILD_MESSAGE_TYPING",
            //"DIRECT_MESSAGES",
            "DIRECT_MESSAGE_REACTIONS",
            "DIRECT_MESSAGE_TYPING"
        ])
    },
    fetchAllMembers: true
});
client.login(process.env.token_executor);
client.handler.mongoLogin();
client.handler.events('/../../EVENTS', __dirname);
client.on("error", (e) => client.logger.log(e, "error"));
client.on("warn", (info) => client.logger.log(info, "warn"));
process.on("unhandledRejection", (err) => client.logger.log(err, "caution"));
process.on("warning", (warn) => client.logger.log(warn, "varn"));
process.on("beforeExit", () => console.log('Bitiriliyor...'));
client.handler.events('/Events', __dirname, 'client-events');
client.handler.dotCommands('./Commands/client-commands/');
client.handler.buttons('./Commands/components/');
const { SlashCreator } = require("slash-create");
const { GatewayServer } = require("slash-create");
client.fetchApplication().then((app) => {
    const creator = new SlashCreator({
        applicationID: app.id,
        publicKey: process.env.publicKey,
        token: process.env.token_executor,
        allowedMentions: {
            everyone: false,
            roles: false,
            users: false
        }
    });
    creator.client = client;
    creator.withServer(new GatewayServer((handler) => client.ws.on('INTERACTION_CREATE', handler)));
    client.handler.events('/Events', __dirname, 'slash-events', creator);
    client.handler.slashCommands('./Commands/slash-commands/', creator);
});