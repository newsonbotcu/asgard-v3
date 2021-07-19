const Command = require('../../../Base/Command');
const low = require('lowdb');
const Discord = require('discord.js');
const { checkDays } = require('../../../../../HELPERS/functions');
const Bans = require('../../../../../MODELS/Moderation/Ban');
const { stripIndent } = require('common-tags');
class BanSorgu extends Command {
    constructor(client) {
        super(client, {
            name: "banbilgi",
            description: "Belirtilen kullanıcının banını sorgular",
            usage: "banbilgi etiket/id",
            examples: ["banbilgi 674565119161794560"],
            category: "Sorgu",
            aliases: ["bbilgi"],
            accaptedPerms: ["cmd-crew", "cmd-all"],
            cooldown: 10000
        })
    }
    async run(client, message, args) {
        const emojis = await low(client.adapters('emojis'));
        const banInfo = await message.guild.fetchBan(args[0]);
        if (!banInfo) return message.channel.send(new Discord.MessageEmbed().setDescription(`${emojis.get("warn").value()} Belirtilen **ID*'ye sahip bir banlı kullanıcı bulunamadı.`));
        const banData = await Bans.findOne({ _id: args[0] });
        const embed = new Discord.MessageEmbed().setTitle("Ban Bilgisi").setDescription(stripIndent`
        ${emojis.get("user").value()} **Kullanıcı:** ${banInfo.user.tag}
        ${emojis.get("reason").value()} **Banlanma sebebi:** ${banInfo.reason}
        ${emojis.get("id").value()} **Kullanıcı ID'si:** ${banInfo.user.id}
        \`Komut sebebi:\` ${banData ? banData.reason : "Komut kullanılmamış"}
        \`Komutu Kullanan:\` ${message.guild.members.cache.get(banData ? banData.executor : "123") ? message.guild.members.cache.get(banData.executor) : `Sunucuda değil (${banData.executor})`}
        \`Ban türü:\` ${banData ? banData.type : "Perma"}
        \`Açılacağı tarih:\` ${banData && (banData.type === "temp") ? banData.duration - checkDays(banData.created) : "Açılmayacak"}
        `).setColor('#2f3136').setFooter("Pasific Forever <3");
        await message.channel.send(embed);
        client.cmdCooldown[message.author.id][this.info.name] = Date.now() + this.info.cooldown;
    }
}
module.exports = BanSorgu;