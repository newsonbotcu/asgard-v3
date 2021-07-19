const Command = require("../../../Base/Command");
const stringTable = require('string-table');
const low = require('lowdb');
const Discord = require("discord.js");
const invites = require('../../../../../MODELS/StatUses/Invites')
class Link extends Command {

    constructor(client) {
        super(client, {
            name: "topdavet",
            description: "sunucunun invite top listini gönderir",
            usage: "topdavet",
            examples: ["topdavet"],
            category: "Stats",
            cmmChannel: "bot-komut",
            cooldown: 300000,
        });
    }

    async run(client, message, args) {

        const emojiler = low(client.adapters('emojis'));
        let docs = [];
        const models = await invites.find();
        const documents = models.filter(doc => doc.records.length > 10).sort(function (a, b) {
            return a.get("records").length - b.get("records").length;
        }).reverse().slice(0, 9);
        for (let index = 0; index < documents.length; index++) {
            const element = documents[index];
            let fff = message.guild.members.cache.get(element._id);
            if (fff) {
                fff = fff.displayName;
            } else {
                fff = 'Bilinmiyor';
            }
            const shem = {
                no: index + 1,
                Kullanıcı: fff,
                miktar: element.records.length,
                net: element.records.filter(i => message.guild.members.cache.get(i.user)).length
            }
            docs.push(shem)
        }
        const embeddoc = stringTable.create(docs, {
            headers: ['no', 'Kullanıcı', 'miktar', 'net']
        });
        const embed = new Discord.MessageEmbed()
        message.channel.send(embed.setTitle("INVITE TOP LIST").setDescription(`\`\`\`md\n${embeddoc}\`\`\``))
        await message.react((await emojiler).get("ok").value().split(':')[2].replace('>', ''));

    }
}

module.exports = Link;
