const Command = require("../../../Base/Command");
const Discord = require("discord.js");
const low = require('lowdb');

class CountByRole extends Command {

    constructor(client) {
        super(client, {
            name: "rolsay",
            description: "belirtilen roldeki kişileri etiketler",
            usage: "rolsay rolid",
            examples: ["rolsay 718265023750996028"],
            cooldown: 3600000,
            category: "Yetkili",
            accaptedPerms: ["cmd-all"]
        });
    }

    async run(client, message, args) {

        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        const mentionedRole = message.guild.roles.cache.get(args[0]);
        await message.channel.send(`\`\`\`${mentionedRole.name} Rolüne Sahip Online Olan ${mentionedRole.members.size} Kişi Bulunmaktadır \`\`\``);
        for (let index = 0; index < Math.floor(mentionedRole.members.array().length / 40); index++) {
            setTimeout(async () => {
                console.log(index);
                await message.channel.send(new Discord.MessageEmbed().setTitle(`BÖLÜM ${index + 1}:`).setDescription(mentionedRole.members.array().slice(index * 40, (index + 1) * 40).join(', ')));
            }, 250);

        }
        await message.react(emojis.get("ok").value().split(':')[2].replace('>', ''));


    }

}

module.exports = CountByRole;