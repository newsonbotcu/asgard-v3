const Discord = require('discord.js');
const Command = require("../../../Base/Command");
const low = require('lowdb');
const { stripIndent } = require('common-tags');
const VoiceRecords = require('../../../../../MODELS/StatUses/VoiceRecords');
const { comparedate, sayi, checkMins } = require('../../../../../HELPERS/functions');
class Nerede extends Command {

    constructor(client) {
        super(client, {
            name: "ses",
            description: "Etiketlenen kişinin ses dökümlerini gösterir",
            usage: "ses id/etiket",
            examples: ["ses 674565119161794560"],
            aliases: ["döküm"],
            category: "Genel",
            cmdChannel: "bot-komut",
            cooldown: 300000
        });
    }

    async run(client, message, args) {

        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        const embed = new Discord.MessageEmbed().setColor('#2f3136');
        const mentioned = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!mentioned) return message.channel.send(new Discord.MessageEmbed().setDescription(`${emojis.get("kullaniciyok").value()} Kullanıcı bulunamadı!`).setColor('#2f3136'));
        if (args[1] && sayi(!args[1])) return message.channel.send(`Bir sayı girmelisin`)
        const data = await VoiceRecords.findOne({ _id: mentioned.user.id });
        const myData = data.records.sort((a, b) => comparedate(b.enter) - comparedate(a.enter));
        const embedi = embed.setDescription(stripIndent`
        **Son Aktivite:**
        Kanal: ${message.guild.channels.cache.get(myData[args[1] || 0].channelID) || "Bilinmiyor"}
        Süre: ${Math.floor(checkMins(myData[args[1] || 0].enter) - checkMins(myData[args[1] || 0].exit))} dakika
        `);
        message.channel.send(embedi);

    }
}

module.exports = Nerede;