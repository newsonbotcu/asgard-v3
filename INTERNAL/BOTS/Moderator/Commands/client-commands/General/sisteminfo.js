const Discord = require('discord.js');
const Command = require("../../../Base/Command");
const Os = require('os');
const low = require('lowdb');
const { stripIndents } = require('common-tags');
const { checkHours } = require('../../../../../HELPERS/functions');
class Call extends Command {

    constructor(client) {
        super(client, {
            name: "sisteminfo",
            description: "Botun durumunu gösterir",
            usage: "sisteminfo",
            examples: ["sisteminfo"],
            category: "Genel",
            aliases: ["syi"],
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
        ${emojis.get("platform").value()} İşletim Sistemi: \`${Os.platform()} ${Os.arch()}\`
        ${emojis.get("platform").value()} Sahibi: **${client.owner.username}**
        ●▬▬▬▬▬▬▬▬▬●
        ${emojis.get("version").value()} Version: \`${Os.version().split(' ')[0]}\`
        ${emojis.get("version").value()} Sürüm: \`${Os.release()}\`
        ${emojis.get("version").value()} Tip: \`${Os.type()}\`
        ●▬▬▬▬▬▬▬▬▬●
        ${emojis.get("uptime").value()} Boş Hafıza: \`${(Os.freemem() / 1024 / 1024).toFixed(2)} MB\`
        ${emojis.get("uptime").value()} Toplam Hafıza: \`${(Os.totalmem() / 1024 / 1024).toFixed(2)} MB\`
        ${emojis.get("uptime").value()} Çalışma Süresi: \`${Math.floor(Os.uptime() / 3600)} Saat\`
        ●▬▬▬▬▬▬▬▬▬●
        ${emojis.get("type").value()} Gecikme: \`${client.ws.ping} ms\`
        ${emojis.get("type").value()} Süre: \`${Math.floor(process.uptime() / 3600)} Saat\`
        `);
        await message.channel.send(embed.setColor('#2f3136').setAuthor("VDS için tıklayınız", client.owner.displayAvatarURL({ dynamic: true }), "https://www.odeaweb.com/r/210"));
    }
}

module.exports = Call;