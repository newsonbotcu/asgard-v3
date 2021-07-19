const { SlashCommand, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const { stripIndent } = require('common-tags');
const gangs = require('../../../../../MODELS/Datalake/gang');
const IDS = require('../../../../../BASE/personels.json');

module.exports = class RegistryCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'ekipler',
            description: 'Sunucunun ekip bilgilerini verir',
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
            },
            throttling: {
                duration: 60,
                usages: 1
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
        const ekipler = await gangs.find();
        const ekipDatas = ekipler.map(ekip => stripIndent`
        İsim: **${ekip._id} #${ekip.discriminator}** [${guild.roles.cache.get(ekip.roleID)}]
        • Toplam Üye: ${guild.roles.cache.get(ekip.roleID).members.size} (${guild.roles.cache.get(ekip.roleID).members.array().filter(m => m.user.presence.status !== 'offline').length} Aktif)
        • Tagdaki Üye: ${guild.roles.cache.get(ekip.roleID).members.array().filter(m => m.user.username.includes(client.config.tag)).length}
        • Sesteki Üye: ${guild.voiceStates.cache.filter(state => state.channel && state.member.roles.cache.has(ekip.roleID)).size}
        `).join("\n●▬▬▬▬▬▬▬●\n");
        const embed = new Discord.MessageEmbed().setDescription(ekipDatas).setTitle(guild.name).setThumbnail(guild.iconURL()).setColor('#7bf3e3');
        await ctx.send({
            embeds: [embed]
        }).then(msg => {
            setTimeout(async () => {
                await msg.delete();
            }, 10000);
        });

    }
}