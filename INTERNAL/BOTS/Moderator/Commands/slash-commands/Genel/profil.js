const { SlashCommand, CommandOptionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const { stripIndent } = require('common-tags');
const { rain, checkDays } = require('../../../../../HELPERS/functions');
const Profile = require('../../../../../MODELS/Economy/profile');
const IDS = require('../../../../../BASE/personels.json');
module.exports = class AvatarCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'profil',
            description: 'Kişinin profilini gösterir',
            options: [
                {
                    type: CommandOptionType.USER,
                    name: 'kullanıcı',
                    description: 'Kullanıcıyı belirtiniz',
                    required: false
                }
            ],
            guildIDs: [IDS.guild],
            deferEphemeral: false,
            throttling: {
                duration: 10,
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
        const userID = Object.values(ctx.options)[0] || ctx.member.user.id;
        const mentioned = client.guilds.cache.get(ctx.guildID).members.cache.get(userID);
        const emojis = await low(client.adapters('emojis'));
        const errEmbed = new Discord.MessageEmbed().setDescription(`Kullanıcı bulunamadı!`).setColor('#2f3136')
        if (!mentioned) return ctx.send({
            embeds: [errEmbed]
        });
        const myProfile = await Profile.findOne({ _id: mentioned.user.id });
        const embedd = new Discord.MessageEmbed().setDescription(stripIndent`
        **${mentioned.displayName}** Kullanıcısının bilgileri:
        \`Katılma Tarihi:\` ${checkDays(mentioned.joinedAt)} **Gün Önce**
        \`Oluşturma Tarihi:\` ${checkDays(mentioned.user.createdAt)} **Gün Önce**
        \`Ayırıcı Rolü:\` ${mentioned.roles.cache.array().filter(r => r.hoist).sort((a, b) => b.rawPosition - a.rawPosition)[0]}
        \`Durumu:\` ${mentioned.user.presence.activities.find(a => a.type === "CUSTOM_STATUS") ? mentioned.user.presence.activities.find(a => a.type === "CUSTOM_STATUS").state : "Bulunamadı"}
        \`Xp:\` ${myProfile ? myProfile.xp : 0}
        `).setThumbnail(mentioned.user.displayAvatarURL()).setColor(mentioned.displayHexColor).setTitle("Asgard Kill Zone");
        await ctx.send({
            embeds: [embedd]
        });
    }
}
