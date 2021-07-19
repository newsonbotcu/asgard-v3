const Command = require("../../../Base/Command");
const Discord = require("discord.js");
const low = require('lowdb');
class Move extends Command {

    constructor(client) {
        super(client, {
            name: "kilit",
            description: "Mesajın atıldığı kanalı kilitler",
            usage: "kilit",
            examples: ["kilit"],
            cooldown: 3600000,
            category: "Düzen",
            accaptedPerms: ["cmd-single", "cmd-double", "cmd-ceo"]
        });
    }

    async run(client, message, args) {

        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        if (args[0] && (args[0] === "aç")) {
            await message.react(emojis.get("ok").value().split(':')[2].replace('>', ''));
            return await message.channel.updateOverwrite(message.guild.roles.everyone.id, {
                SEND_MESSAGES: null
            });
        }
        await message.channel.updateOverwrite(message.guild.roles.everyone.id, {
            SEND_MESSAGES: false
        });
        await message.channel.updateOverwrite(roles.get("cmd-ceo").value(), {
            SEND_MESSAGES: true
        });
        await message.channel.updateOverwrite(roles.get("cmd-single").value(), {
            SEND_MESSAGES: true
        });
        await message.channel.updateOverwrite(roles.get("cmd-double").value(), {
            SEND_MESSAGES: true
        });
        await message.channel.updateOverwrite(roles.get("owner").value(), {
            SEND_MESSAGES: true
        });
        await message.react(emojis.get("ok").value().split(':')[2].replace('>', ''));


    }

}

module.exports = Move;