const Command = require("../../../Base/Command");
const Discord = require("discord.js");
const low = require('lowdb');
class Move extends Command {

    constructor(client) {
        super(client, {
            name: "kanalsustur",
            description: "Bulunulan kanalın izinlerinden konuşmayı engeller ve herkesi tekrar aynı kanala taşıyarak susturur.",
            usage: "kanalsustur",
            examples: ["kanalsustur"],
            cooldown: 3600000,
            category: "Düzen",
            accaptedPerms: ["cmd-transport", "cmd-all"]
        });
    }

    async run(client, message, args) {

        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        if (!message.member.voice.channel) return message.channel.send(new Discord.MessageEmbed().setDescription(`${emojis.get("warn").value()} Bir kanalda bulunman gerek!`).setColor('#2f3136'));
        const channel = message.guild.channels.cache.get(message.member.voice.channel.id);
        if (channel.permissionOverwrites.get(message.guild.roles.everyone.id).deny.toArray().includes("SPEAK")) {
            await channel.updateOverwrite(message.guild.roles.everyone.id, {
                SPEAK: null
            });
            channel.members.forEach(async m => {
                await m.voice.setChannel(channel.id);
            });
            await message.react(emojis.get("ok").value().split(':')[2].replace('>', ''));
            return;
        }
        await channel.updateOverwrite(message.guild.roles.everyone.id, {
            SPEAK: false
        });
        channel.members.forEach(async m => {
            await m.voice.setChannel(channel.id);
        });
        await message.react(emojis.get("ok").value().split(':')[2].replace('>', ''));


    }

}

module.exports = Move;