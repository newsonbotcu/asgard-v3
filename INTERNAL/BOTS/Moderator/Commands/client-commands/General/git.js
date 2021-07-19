const Discord = require('discord.js');
const Command = require("../../../Base/Command");
const low = require('lowdb');
class Git extends Command {

    constructor(client) {
        super(client, {
            name: "git",
            description: "İstediğiniz kişinin odasına gidin",
            usage: "git etiket/id",
            examples: ["git 674565119161794560"],
            category: "Genel",
            cmdChannel: "bot-komut",
            cooldown: 10000
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
        let kanal = mentioned.voice.channel;
        if (!kanal) return message.react(emojis.get("komutret").value().split(':')[2].replace('>', ''));
        if (!message.member.voice || !message.member.voice.channel) return message.react(emojis.get("komutret").value().split(':')[2].replace('>', ''));
        if (message.member.roles.cache.has(roles.get("owner").value() && (mentioned.voice.channel.parentID !== channels.get("st_private").value()))) return await message.member.voice.setChannel(mentioned.voice.channel.id);
        if (kanal.id === message.member.voice.channel.id) return message.react(emojis.get("komutret").value().split(':')[2].replace('>', ''));
        try {
            await message.react(emojis.get("komutonay").value().split(':')[2].replace('>', ''));
            await message.react(emojis.get("komutret").value().split(':')[2].replace('>', ''));
        } catch (error) {
            console.error(error);
        }
        const filter = (reaction, user) => user.id !== message.client.user.id;
        const collector = message.createReactionCollector(filter, {
            time: 120000
        });
        collector.on("collect", async (reaction, user) => {
            if (user.id !== mentioned.user.id) return reaction.users.remove(user);
            kanal = mentioned.voice.channel;
            if (!kanal) {
                collector.stop();
                return message.channel.send("Hangi kanalda olduğunu bulamıyorum!");
            }
            switch (reaction.emoji.id) {
                case emojis.get("komutonay").value().split(':')[2].replace('>', ''):
                    await message.member.voice.setChannel(kanal.id);
                    collector.stop("ok");
                    break;
                case emojis.get("komutret").value().split(':')[2].replace('>', ''):
                    collector.stop();
                    break;
                default:
                    break;
            }
        });
        collector.on("end", async (collected, reason) => {
            if (reason === "ok") {
                return message.reactions.cache.find(r => r.emoji.id === emojis.get("komutret").value().split(':')[2].replace('>', '')).remove();
            } else {
                return message.reactions.cache.find(r => r.emoji.id === emojis.get("komutonay").value().split(':')[2].replace('>', '')).remove();
            }
        });
    }
}

module.exports = Git;