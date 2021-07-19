const Discord = require('discord.js');
const Command = require("../../../Base/Command");
const low = require('lowdb');
const { stripIndents } = require('common-tags');
const { checkDays, rain } = require('../../../../../HELPERS/functions');
class Call extends Command {

    constructor(client) {
        super(client, {
            name: "sunucuinfo",
            description: "Botun durumunu gösterir",
            usage: "sunucuinfo",
            examples: ["sunucuinfo"],
            category: "Genel",
            aliases: ["sunucu"],
            cmdChannel: "bot-komut",
            cooldown: 300000
        });
    }

    async run(client, message, args) {
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));

        const embed = new Discord.MessageEmbed().setDescription(stripIndents`
        ${emojis.get("pandomeme").value()} Açılma Tarihi: ${rain(client, checkDays(message.guild.createdAt))} **gün önce**
        ${emojis.get("pandomeme").value()} Taç sahibi: **${message.guild.owner.user.username}**
        ●▬▬▬▬▬▬▬▬▬●
        ${emojis.get("lock").value()} Kanal sayısı: ${rain(client, message.guild.channels.cache.size)}
        ${emojis.get("lock").value()} Rol sayısı: ${rain(client, message.guild.roles.cache.size)}
        ${emojis.get("lock").value()} Emoji sayısı: ${rain(client, message.guild.emojis.cache.size)}
        ●▬▬▬▬▬▬▬▬▬●
        ${emojis.get("maviskull").value()} Toplam üye: ${rain(client, message.guild.memberCount)}
        ${emojis.get("maviskull").value()} Çevrimiçi üye: ${rain(client, message.guild.members.cache.filter(m => m.presence.status !== 'offline').size)}
        ${emojis.get("maviskull").value()} Yetkili üye: ${rain(client, message.guild.members.cache.filter(m => m.roles.cache.has(roles.get("crew").value())).size)}
        ${emojis.get("maviskull").value()} Zindandaki üye: ${rain(client, message.guild.members.cache.filter(m => m.roles.cache.has(roles.get("prisoner").value())).size)}
        ${emojis.get("maviskull").value()} Kayıtsız üye: ${rain(client, message.guild.members.cache.filter(m => m.roles.cache.has(roles.get("welcome").value())).size)}
        ${emojis.get("maviskull").value()} Booster üye: ${rain(client, message.guild.members.cache.filter(m => m.roles.cache.has(roles.get("booster").value())).size)}
        ●▬▬▬▬▬▬▬▬▬●

        `);
        await message.channel.send(embed.setColor('#2f3136').setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }), "https://tantoony.net/"));
    }
}

module.exports = Call;