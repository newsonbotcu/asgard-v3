const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const IDS = require('../../../../../BASE/personels.json');
module.exports = class AFKCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'booster',
            description: 'Boosterların isim değiştirme komutu.',
            options: [
                {
                    type: CommandOptionType.STRING,
                    name: 'isim',
                    description: 'İsmin ne olsun?',
                    required: true,
                }
            ],
            deferEphemeral: false,
            defaultPermission: false,
            guildIDs: [IDS.guild],
            permissions: {
                [IDS.guild]: [
                    {
                        type: ApplicationCommandPermissionType.ROLE,
                        id: IDS.booster,
                        permission: true
                    }
                ]
            },
            throttling: {
                duration: 120,
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
        const mentioned = client.guilds.cache.get(ctx.guildID).members.cache.get(ctx.user.id);
        let point = '⸸';
        if (client.config.tag.some(tag => mentioned.user.username.includes(tag))) {
            await mentioned.roles.add(roles.get("crew").value());
            point = client.config.tag[0];
        }
        await mentioned.setNickname(`${point} ${ctx.options["isim"]}`);
        const embed = new Discord.MessageEmbed().setColor('#2f3136').setDescription(`${emojis.get("pando1").value()} Başarıyla Ayarlandı!`);
        await ctx.send({
            embeds: [embed]
        });
    }
}
