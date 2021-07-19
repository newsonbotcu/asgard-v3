const Discord = require('discord.js');
const Command = require("../../../Base/Command");
const low = require('lowdb');
class Avatar extends Command {

    constructor(client) {
        super(client, {
            name: "ysay",
            description: "Seste olmayan etiketler",
            usage: "ysay @etiket/id",
            examples: ["ysay 674565119161794560"],
            category: "Düzen",
            aliases: [],
            accaptedPerms: ["cmd-all", "cmd-manager", "cmd-rhode"],
            cooldown: 10000
        });
    }

    async run(client, message, args) {
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        let rol = message.guild.roles.cache.get(args[0]);
        if (!rol) rol = message.guild.roles.cache.get(roles.get("cmd-crew").value());
        if (!rol) return await message.channel.send(`Böyle bir rol bulunmamaktadır.`);
        const members = rol.members.filter(member => member.user.presence.status !== 'offline').filter(m => !m.voice.channel).map(m => `<@${m.user.id}>`);
        await message.channel.send(`\`\`\`${rol.name} Rolüne Sahip Online Olan ${members.length} Kişi Bulunmaktadır \`\`\``);
        for (let index = 0; index < Math.floor(members.length / 40) + 1; index++) {
            await message.channel.send(`BÖLÜM ${index + 1}:` + `\`\`\`${members.slice(index * 40, (index + 1) * 40).join(', ')}\`\`\``);
        }



    }
}

module.exports = Avatar;