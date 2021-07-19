const Command = require("../../../Base/Command");
const Discord = require("discord.js");
const low = require('lowdb');
class Move extends Command {

    constructor(client) {
        super(client, {
            name: "kanaltaşı",
            description: "kanalda bulunan kişileri toplu olarak bir kanala taşır",
            usage: "kanaltaşı kanalid/etiket/id",
            examples: ["kanaltaşı 718265023750996028"],
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
        if (!args[0]) return message.channel.send(new Discord.MessageEmbed().setColor('#2f3136').setDescription(`${emojis.get("warn").value()} Bir kanal belirlemelisin.`));
        const channel = message.guild.channels.cache.get(message.member.voice.channel.id);
        const goingto = message.mentions.members.first() ? message.guild.channels.cache.get(message.mentions.members.first().voice.channel.id) : (message.guild.channels.cache.get(args[0]) || message.guild.channels.cache.get(message.guild.members.cache.get(args[0]).voice.channel.id));
        if (!goingto) return message.channel.send(new Discord.MessageEmbed().setColor('#2f3136').setDescription(`${emojis.get("notfound").value()} Kanal bulunamadı.`));
        channel.members.forEach(async mem => {
            await mem.voice.setChannel(goingto.id);
        });
        await message.react(emojis.get("ok").value().split(':')[2].replace('>', ''));


    }

}

module.exports = Move;