const Discord = require('discord.js');
const Command = require("../../../Base/Command");
const low = require('lowdb');
class Avatar extends Command {

    constructor(client) {
        super(client, {
            name: "yardım",
            description: "Bütün komutları kategoriye bölerek açıklar ya da belirtiklen komutu detaylandırır.",
            usage: "yardım",
            examples: ["yardım", "yardım cmute"],
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
        const prx = client.config.prefix;
        const commands = client.commands.filter(cmd => cmd.config.enabled)
        const emb = new Discord.MessageEmbed();
        const embed = new Discord.MessageEmbed().setFooter("Detaylı bilgi için .yardım <komut adı>");
        const embedfst = new Discord.MessageEmbed()
            .addField(".yardım moderasyon", "Moderasyon komutlarını gösterir")
            .addField(".yardım düzen", "Düzenleme komutlarını gösterir")
            .addField(".yardım genel", "Genel komutları gösterir")
            .addField(".yardım sorgu", "Sorgu komutları gösterir")
            .addField(".yardım stats", "Stat komutları gösterir")
            .addField(".yardım kayıt", "Kayıt komutlarını gösterir");
        if (!args[0]) return message.channel.send(embedfst);
        let cmd = commands.get(args[0]) || commands.get(client.aliases.get(args[0]));
        if (!cmd) {
            commands.filter(cmdz => cmdz.info.category.toLowerCase() == args[0].toLowerCase()).forEach(async (command) => {
                embed.addField(prx + command.info.name, command.info.description, true);
            });
            if (embed.fields.length === 0) return message.channel.send(new Discord.MessageEmbed().setDescription(`${emojis.get("error").value()} bir şeyler ters gitti..`).setColor('RED'));
            message.channel.send(embed.setTitle(args[0].toUpperCase() + " KOMUTLARI"));
        } else {
            let acceptedroles = cmd.info.accaptedPerms.map(rolename => message.guild.roles.cache.get(roles.get(rolename).value())).join('\n');
            if (acceptedroles.length < 5) acceptedroles = ["\`-Genel Komut-\`"];
            let allias = cmd.info.aliases.join(', ');
            if (cmd.info.aliases.length === 0) allias = ["\`EŞDEĞERİ YOK\`"]
            emb.setDescription(cmd.info.description);
            emb.setTitle(cmd.info.name.toUpperCase() + " Komut Bilgisi");
            emb.addField("Kullanım:", prx + cmd.info.usage);
            emb.addField("Eşdeğerleri:", allias);
            emb.addField("Örnekler:", cmd.info.examples.map(e => prx + e).join('\n'));
            emb.addField("Kategori", cmd.info.category);
            emb.addField("Süresi:", cmd.info.cooldown / 1000 + " Saniye");
            emb.addField("Kullanabilen Roller:", acceptedroles);
            message.channel.send(emb);
        }
    }
}

module.exports = Avatar;