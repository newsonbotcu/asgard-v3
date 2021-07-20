const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const IDS = require('../../../../../BASE/personels.json');
module.exports = class BanCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'yetki',
            description: 'Kişiye rol verir',
            options: [
                {
                    type: CommandOptionType.USER,
                    name: 'kullanıcı',
                    description: 'Kullanıcıyı belirtiniz',
                    required: true
                },
                {
                    type: CommandOptionType.STRING,
                    name: 'işlem',
                    description: 'yapılacak işlem',
                    required: true,
                    choices: [
                        {
                            name: "Alçalt",
                            value: "down"
                        },
                        {
                            name: "Yükselt",
                            value: "up"
                        }
                    ]
                }
            ],
            deferEphemeral: false,
            defaultPermission: false,
            guildIDs: [IDS.guild],
            permissions: {
                [IDS.guild]: [
                    {
                        type: ApplicationCommandPermissionType.ROLE,
                        id: IDS.manager,
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
                duration: 60000,
                usages: 6
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
        const userID = Object.values(ctx.options)[0];
        const mentioned = guild.members.cache.get(userID);
        const exeMember = guild.members.cache.get(ctx.user.id);
        if (!mentioned) return await ctx.send(`Kullanıcı bulunamadı`, {
            ephemeral: true
        });
        if (exeMember.roles.highest.rawPosition <= mentioned.roles.highest.rawPosition) return await ctx.send(`Bunu yapmak için yeterli yetkiye sahip değilsin.`, {
            ephemeral: true
        });
        const taglırol = guild.roles.cache.get(roles.get("starter").value());
        const hoistroller = guild.roles.cache
            .filter(r => r.rawPosition > taglırol.rawPosition + 2)
            .filter(r => r.hoist)
            .filter(r => r.id !== roles.get("booster").value())
            .sort((a, b) => a.rawPosition - b.rawPosition).array().reverse();
        const rawrol = mentioned.roles.cache.filter(r => r.hoist).sort((a, b) => a.rawPosition - b.rawPosition).array().reverse()[0];

        switch (ctx.options["işlem"]) {
            case "down":
                let currol = hoistroller.find(r => r.rawPosition < rawrol.rawPosition);
                let oldrol = hoistroller.find(r => r.rawPosition === rawrol.rawPosition);
                if (!currol) currol = hoistroller.reverse()[0];
                if (currol.rawPosition > guild.roles.cache.get(roles.get("finisher").value()).rawPosition) return await ctx.send("Bu imkansız!", {
                    ephemeral: true
                });
                if (currol) await mentioned.roles.add(currol.id);
                if (oldrol) await mentioned.roles.remove(oldrol.id);
                await ctx.send(`Üzgünüm ${mentioned}. Umarım ilerde tekrar yükselirsin.`);
                break;

            case "up":
                let curroll = hoistrollerr.reverse().find(r => r.rawPosition > rawrol.rawPosition);
                let oldroll = hoistrollerr.reverse().find(r => r.rawPosition === rawrol.rawPosition);
                if (curroll.rawPosition >= guild.roles.cache.get(roles.get("finisher").value()).rawPosition) return await ctx.send("Bu imkansız!", {
                    ephemeral: true
                });
                if (curroll) await mentioned.roles.add(currol.id);
                if (oldroll) await mentioned.roles.remove(oldrol.id);
                await ctx.send(`Hayırlı Olsun ${mentioned}, Artık __**${currol.name}**__ Rolüne Sahipsin.`);
                break;

            default:
                break;
        }
    }
}
