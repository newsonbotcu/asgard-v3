const Discord = require('discord.js');
const Command = require("../../../Base/Command");
const low = require('lowdb');
class Avatar extends Command {

    constructor(client) {
        super(client, {
            name: "temizle",
            description: "mesaj atılan kanalda belirtilen sayıdalki mesajları temizler.",
            usage: "temizle 10",
            examples: ["temizle 10", "temizle 100"],
            category: "Düzen",
            aliases: ["sil"],
            accaptedPerms: ["cmd-authority", "root"],
            cooldown: 10000
        });
    }

    async run(client, message, args) {
        const emojis = await low(client.adapters('emojis'));

        function allah(anan) {
            var reg = new RegExp("^\\d+$");
            var valid = reg.test(anan);
            return valid;
        }

        if (!allah(args[0])) return message.channel.send('Böyle bir sayı yok!');


        const amount = args[0];

        if (!amount) return message.channel.send("Kaç mesaj sileceğimi yazmalısın!").then(msg => msg.delete({ timeout: 10000 })),
            message.delete({ timeout: 10000 });
        if (isNaN(amount)) return message.channel.send('Sayı yazmalısın!').then(msg => msg.delete({ timeout: 10000 })),
            message.delete({ timeout: 10000 });

        if (amount > 100) return message.channel.send('100 mesajdan fazla silemezsin!').then(msg => msg.delete({ timeout: 10000 })),
            message.delete({ timeout: 10000 });
        if (amount < 1) return message.channel.send('En az bir mesajı silebilirsin..').then(msg => msg.delete({ timeout: 10000 })),
            message.delete({ timeout: 10000 });

        await message.channel.messages.fetch(
            { limit: amount }).then(messages => {
                message.channel.bulkDelete(messages);
                message.channel.send(`${messages.size} Mesaj Temizlenmiştir`)
            });

    }
}

module.exports = Avatar;