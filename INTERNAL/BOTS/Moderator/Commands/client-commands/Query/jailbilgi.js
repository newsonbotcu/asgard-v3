const Command = require('../../../Base/Command');
const low = require('lowdb');
const Discord = require('discord.js');
const { checkDays } = require('../../../../../HELPERS/functions');
const Jails = require('../../../../../MODELS/Moderation/Jails');
const { stripIndent } = require('common-tags');
class JailSorgu extends Command {
    constructor(client) {
        super(client, {
            name: "jailbilgi",
            description: "Belirtilen kullanıcının cezasını sorgular",
            usage: "jailbilgi etiket/id",
            examples: ["jailbilgi 674565119161794560"],
            category: "Sorgu",
            aliases: ["jbilgi"],
            accaptedPerms: ["cmd-crew", "cmd-all"],
            cooldown: 10000
        })
    }
    async run(client, message, args) {
        const emojis = await low(client.adapters('emojis'));
        let mentionedID = message.mentions.members.first() ? message.mentions.members.first().user.id : args[0];
        if (!mentionedID) return message.channel.send(new Discord.MessageEmbed().setDescription(`${emojis.get("warn").value()} Bir id veya kullanıocı belirtmelisin!`));
        const jailData = await Jails.findOne({ _id: mentionedID });
        if (!jailData) return message.channel.send(`${emojis.get("notfound").value()} Belirtilen kullanıcıya ait herhangi bir **Jail** kaydı bulunamadı!`)
        const embed = new Discord.MessageEmbed().setTitle("Jail Bilgisi").setDescription(stripIndent`
        ${emojis.get("user").value()} **Kullanıcı:** ${message.guild.members.cache.get(mentionedID) || `Sunucuda değil (${mentionedID})`}
        ${emojis.get("reason").value()} **Jail sebebi:** ${jailData.reason}
        ${emojis.get("id").value()} **Kullanıcı ID'si:** ${mentionedID}
        \`Komut sebebi:\` ${jailData.reason}
        \`Komutu Kullanan:\` ${message.guild.members.cache.get(jailData.executor) || `Sunucuda değil (${jailData.executor})`}
        \`Jail türü:\` ${jailData.type}
        \`Açılacağı tarih:\` ${(jailData.type === "temp") ? jailData.duration - checkDays(jailData.created) : "Açılmayacak"}
        `).setColor('#2f3136').setFooter("Pasific Forever <3");
        await message.channel.send(embed);
        client.cmdCooldown[message.author.id][this.info.name] = Date.now() + this.info.cooldown;
    }
}
module.exports = JailSorgu;