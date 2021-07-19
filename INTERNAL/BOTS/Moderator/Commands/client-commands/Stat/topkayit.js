const Command = require("../../../Base/Command");
const stringTable = require('string-table');
const low = require('lowdb');
const Discord = require("discord.js");
const invites = require('../../../../../MODELS/Datalake/Registered');
class Link extends Command {

    constructor(client) {
        super(client, {
            name: "topkayit",
            description: "sunucunun invite top listini gönderir",
            usage: "topkayit",
            examples: ["topkayit"],
            aliases: ["topkayıt"],
            category: "Stats",
            cmmChannel: "bot-komut",
            cooldown: 300000,
        });
    }

    async run(client, message, args) {

        const emojiler = low(client.adapters('emojis'));

        const models = await invites.find();
        let mapp = {};
        models.forEach(doc => {
            if (!mapp[doc.executor]) mapp[doc.executor] = 0;
            mapp[doc.executor] = mapp[doc.executor] + 1;
        });
        const sorted = Object.keys(mapp).sort((a, b) => mapp[b] - mapp[a]);
        let docs = [];
        for (let index = 0; index < 10; index++) {
            const shem = {
                no: index + 1,
                Kullanıcı: message.guild.members.cache.get(sorted[index]) ? message.guild.members.cache.get(sorted[index]).displayName : "Bilinmiyor",
                miktar: mapp[sorted[index]],
            }
            docs.push(shem)
        }
        const embeddoc = stringTable.create(docs, {
            headers: ['no', 'Kullanıcı', 'miktar']
        });
        const embed = new Discord.MessageEmbed()
        message.channel.send(embed.setTitle("REGISTRY TOP LIST").setDescription(`\`\`\`md\n${embeddoc}\`\`\``))


        await message.react((await emojiler).get("ok").value().split(':')[2].replace('>', ''));



    }
}

module.exports = Link;
