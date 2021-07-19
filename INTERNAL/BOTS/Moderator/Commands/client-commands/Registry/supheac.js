const Command = require('../../../Base/Command');
const Discord = require('discord.js');
const low = require('lowdb');
const { rain, checkDays } = require('../../../../../HELPERS/functions');
const { stripIndents } = require('common-tags');
class Supheac extends Command {
    constructor(client) {
        super(client, {
            name: "supheac",
            description: "Şüpheli bir üyeyi kayıtsıza alır",
            usage: "supheac etiket/id",
            examples: ["supheac 674565119161794560"],
            category: "Kayıt",
            aliases: ["şüpheaç", "şüphemyok", "suphemyok"],
            cmdChannel: "suspicious",
            accaptedPerms: ["cmd-registry", "cmd-double", "cmd-single", "cmd-ceo"],
            cooldown: 10000
        });
    };
    async run(client, message, args) {
        client = this.client;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        let mentioned = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!mentioned) return message.channel.send(new Discord.MessageEmbed().setDescription(`${emojis.get("kullaniciyok").value()} Kullanıcı bulunamadı!`).setColor('#2f3136'));
        if (!mentioned.roles.cache.has(roles.get("suspicious").value())) return message.channel.send(new Discord.MessageEmbed().setDescription(`Etiketlediğin kişi şüpheli değil!`));
        await mentioned.roles.remove(roles.get("suspicious").value());
        await mentioned.roles.add(roles.get("welcome").value());
        const embed = new Discord.MessageEmbed()
            .setColor("#2f3136")
            .setDescription(
                stripIndents`
            
         ${emojis.get("pando1").value()} Aramıza hoş geldin **${mentioned.user.username}**
    
         ${emojis.get("pando2").value()} Seninle beraber **${rain(client, message.guild.memberCount)}** kişiyiz.
    
         ${emojis.get("pando3").value()} **Hesap:** ${rain(client, checkDays(mentioned.user.createdAt))} gün önce açılmıştır.
        
        `).setThumbnail(mentioned.user.displayAvatarURL());
        await message.guild.channels.cache.get(channels.get("welcome").value()).send(embed);
        await message.react(emojis.get("ok").value().split(':')[2].replace('>', ''));
        await message.guild.channels.cache.get(channels.get("mod-registry").value()).send(new Discord.MessageEmbed().setDescription(`${message.member} yetkilisi ${mentioned} kullanıcısının şüphesini kaldırdı.`));

    }
}
module.exports = Supheac;