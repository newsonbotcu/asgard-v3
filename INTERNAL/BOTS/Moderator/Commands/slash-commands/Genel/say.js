const { SlashCommand, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const { stripIndent } = require('common-tags');
const IDS = require('../../../../../BASE/personels.json');

module.exports = class RegistryCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'say',
            description: 'Sunucunun anlık bilgilerini verir',
            deferEphemeral: false,
            defaultPermission: false,
            guildIDs: [IDS.guild],
            permissions: {
                [IDS.guild]: [
                    {
                        type: ApplicationCommandPermissionType.ROLE,
                        id: IDS.commands,
                        permission: true
                    },
                    {
                        type: ApplicationCommandPermissionType.ROLE,
                        id: IDS.owner,
                        permission: true
                    },
                    {
                        type: ApplicationCommandPermissionType.ROLE,
                        id: IDS.root,
                        permission: true
                    }
                ]
            }
        });

        this.filePath = __filename;
    }

    async run(ctx) {
        const client = ctx.creator.client;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const channels = await low(client.adapters('channels'));
        const emojis = await low(client.adapters('emojis'));
        const guild = client.guilds.cache.get(ctx.guildID);
        const embed = new Discord.MessageEmbed().setDescription(stripIndent`
        \`•\` Toplam üye: \`${guild.memberCount}\` (${guild.members.cache.filter(m => m.presence.status !== 'offline').size} online)
        \`•\` Booster sayısı: \`${guild.members.cache.filter(m => m.roles.cache.has(roles.get("booster").value())).size}\` (${guild.premiumTier}. seviye)
        \`•\` Taglı sayısı: \`${guild.members.cache.filter(m => client.config.tag.some(tag => m.user.username.includes(tag))).size}\` (${guild.members.cache.filter(m => m.roles.cache.has(roles.get("cmd-crew").value())).size} yetkili)
        \`•\` Anlık ses: \`${guild.voiceStates.cache.filter(v => v.channel).size}\` (${guild.voiceStates.cache.filter(v => v.channel && (v.channel.parentID === channels.get("st_public").value())).size} public)
        `).setColor('#7bf3e3');
        await ctx.send({
            embeds: [embed]
        });

    }
}