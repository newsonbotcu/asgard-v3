const Command = require("../../../Base/Command");
const Discord = require("discord.js");
const low = require('lowdb');
class Move extends Command {

    constructor(client) {
        super(client, {
            name: "kanaledit",
            description: "BBelirtilen kanalın kişi sayısını ayarlar",
            usage: "kanaledit kanalid/etiket/id",
            examples: ["kanaledit 718265023750996028"],
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
        if (!args[0]) return message.channel.send(new Discord.MessageEmbed().setColor('#2f3136').setDescription(`${emojis.get("warn").value()} Bir kanal belirlemelisin.`));
        const channel = message.guild.channels.cache.get(message.member.voice.channel.id);
        
        
        await message.react(emojis.get("ok").value().split(':')[2].replace('>', ''));


    }

}

module.exports = Move;