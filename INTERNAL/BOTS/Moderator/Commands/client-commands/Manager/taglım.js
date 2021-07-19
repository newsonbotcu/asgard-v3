const Command = require("../../../Base/Command");
const Discord = require("discord.js");
const low = require('lowdb');
const { checkSecs } = require("../../../../../HELPERS/functions");
const { stripIndent } = require("common-tags");
const tagged = require("../../../../../MODELS/Temprorary/tagged");

class CountByRole extends Command {

    constructor(client) {
        super(client, {
            name: "rolsay",
            description: "belirtilen roldeki kişileri etiketler",
            usage: "rolsay rolid",
            examples: ["rolsay 718265023750996028"],
            cooldown: 3600000,
            category: "Yetkili",
            accaptedPerms: ["cmd-crew"]
        });
    }

    async run(client, message, args) {

        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        const mentioned = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!mentioned) return message.channel.send(new Discord.MessageEmbed().setDescription(`${emojis.get("kullaniciyok").value()} Kullanıcı bulunamadı!`).setColor('#2f3136'));
        if (mentioned.user.id === message.member.user.id) return message.channel.send(new Discord.MessageEmbed().setDescription(`${emojis.get("pando1").value()} Kendi kendini etiketleme..`).setColor('#2f3136'));
        const TagData = await Tagli.findOne({ _id: mentioned.user.id, claim: "false" });
        if (!TagData || checkSecs(TagData.created) > 300) return message.channel.send(new Discord.MessageEmbed().setDescription(`${emojis.get("kullaniciyok").value()} En erken 5 dakika öncesine kadar tag almış biri için bu komutu kuanabilirsin!`));
        await message.react(emojis.get("loading").value().split(':')[2].replace('>', ''));
        await tagged.create({
            _id: message.id,
            executor: message.author.id,
            target: mentioned.user.id,
            channelID: message.channel.id,
            creadet: new Date()
        });


    }

}

module.exports = CountByRole;