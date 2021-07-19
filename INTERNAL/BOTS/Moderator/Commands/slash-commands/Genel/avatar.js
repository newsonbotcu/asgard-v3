const { SlashCommand, CommandOptionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'avatar',
            description: 'Kişinin avatarını gösterir',
            options: [
                {
                    type: CommandOptionType.USER,
                    name: 'kullanıcı',
                    description: 'Kullanıcıyı belirtiniz',
                    required: false
                }
            ],
            deferEphemeral: false
        });

        this.filePath = __filename;
    }

    async run(ctx) {
        const client = ctx.creator.client;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const channels = await low(client.adapters('channels'));
        const userID = Object.values(ctx.options)[0] || ctx.member.user.id;
        const mentioned = client.guilds.cache.get(ctx.guildID).members.cache.get(userID);
        const emojis = await low(client.adapters('emojis'));
        const errEmbed = new Discord.MessageEmbed().setDescription(`${emojis.get("kullaniciyok").value()} Kullanıcı bulunamadı!`).setColor('#2f3136')
        if (!mentioned) return ctx.send({
            embeds: [errEmbed]
        });
        const embed = new Discord.MessageEmbed().setColor('#2f3136').setImage(mentioned.user.displayAvatarURL({ dynamic: true, size: 4096 }))
        await ctx.send({
            embeds: [embed]
        });
    }
}
