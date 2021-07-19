const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const IDS = require('../../../../../BASE/personels.json');
const Permissions = require('../../../../../MODELS/Datalake/permit');
const gen = require('shortid');
const { stripIndent } = require('common-tags');
const { checkMins } = require('../../../../../HELPERS/functions');
module.exports = class BanCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'izin',
            description: 'Kişiye izin verir',
            options: [
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: "ver",
                    description: "Kullanıcıya izin verir",
                    options: [
                        {
                            type: CommandOptionType.USER,
                            name: 'kullanıcı',
                            description: 'Kullanıcıyı belirtiniz',
                            required: true
                        },
                        {
                            type: CommandOptionType.STRING,
                            name: 'tür',
                            description: 'İşlem türü',
                            required: true,
                            choices: [
                                {
                                    name: "kanal",
                                    value: "channel"
                                },
                                {
                                    name: "rol",
                                    value: "role"
                                },
                                {
                                    name: "emoji",
                                    value: "emoji"
                                }
                            ]
                        },
                        {
                            type: CommandOptionType.STRING,
                            name: 'işlem',
                            description: 'Yapılacak işlem',
                            required: true,
                            choices: [
                                {
                                    name: "sil",
                                    value: "delete"
                                },
                                {
                                    name: "düzenle",
                                    value: "update"
                                },
                                {
                                    name: "ekle",
                                    value: "create"
                                }
                            ]
                        },
                        {
                            type: CommandOptionType.INTEGER,
                            name: 'adet',
                            description: 'Kaç işlem yapılacak?',
                            required: true
                        },
                        {
                            type: CommandOptionType.INTEGER,
                            name: 'süre',
                            description: 'İşlem ne kadar sürecek? (dakika bazında',
                            required: true
                        }
                    ]
                },
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: "sil",
                    description: "Kullanıcıdan iznini alır",
                    options: [
                        {
                            type: CommandOptionType.USER,
                            name: 'kullanıcı',
                            description: 'Kullanıcıyı belirtiniz',
                            required: true
                        },
                        {
                            type: CommandOptionType.STRING,
                            name: 'id',
                            description: 'İşlem idsi (göster komutuyla öğrenebilirsiniz)',
                            required: false
                        }
                    ]
                },
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: "göster",
                    description: "Kullanıcının izinlerini gösterir",
                    options: [
                        {
                            type: CommandOptionType.USER,
                            name: 'kullanıcı',
                            description: 'Kullanıcıyı belirtiniz',
                            required: true
                        },
                        {
                            type: CommandOptionType.STRING,
                            name: 'tür',
                            description: 'İşlem türü',
                            required: false,
                            choices: [
                                {
                                    name: "kanal",
                                    value: "kanal"
                                },
                                {
                                    name: "rol",
                                    value: "rol"
                                },
                                {
                                    name: "emoji",
                                    value: "emoji"
                                }
                            ]
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
        const userID = Object.values(ctx.options)[0]["kullanıcı"];
        const mentioned = guild.members.cache.get(userID);
        const exeMember = guild.members.cache.get(ctx.user.id);
        const errEmbed = new Discord.MessageEmbed().setDescription(`${emojis.get("kullaniciyok").value()} Kullanıcı bulunamadı!`).setColor('#2f3136');
        if (!mentioned) return await ctx.send({
            embeds: [errEmbed]
        });
        switch (Object.keys(ctx.options)[0]) {
            case "ver":
                if ((ctx.options["ver"]["tür"] === "role") && (ctx.options["ver"]["işlem"] === "delete")) return await ctx.send(`Rol silme iznini kimseye veremezsin.`, {
                    ephemeral: true
                });
                const myDoc = await Permissions.findOne({
                    user: ctx.options["ver"]["kullanıcı"],
                    effect: ctx.options["ver"]["tür"],
                    type: ctx.options["ver"]["işlem"]
                });
                if (myDoc) return await ctx.send(`${mentioned} kullanıcısı için zaten bu izin bulunmakta.`, {
                    ephemeral: true
                });
                const doc = await Permissions.create({
                    _id: gen.generate(),
                    user: ctx.options["ver"]["kullanıcı"],
                    executor: ctx.user.id,
                    count: ctx.options["ver"]["adet"],
                    effect: ctx.options["ver"]["tür"],
                    type: ctx.options["ver"]["işlem"],
                    created: new Date(),
                    time: ctx.options["ver"]["süre"]
                });
                await ctx.send(`Başarıyla oluşturuldu. **İzin ID'si:** \`${doc._id}\``);
                break;

            case "sil":
                const permDocs = await Permissions.find({ user: ctx.options["sil"]["kullanıcı"] });
                if (permDocs.length === 0) return await ctx.send(`${mentioned} kullanıcısı için hiçbir izin bulunamadı.`, {
                    ephemeral: true
                });
                if (!ctx.options["sil"]["id"]) {
                    await Permissions.deleteMany({ user: ctx.options["sil"]["kullanıcı"] });
                    return await ctx.send(`${mentioned} kullanıcısı için bütün izinler silindi!`);
                }
                await Permissions.deleteOne({ _id: ctx.options["sil"]["id"] });
                await ctx.send(`${mentioned} kullanıcısının bir izni silindi!`);
                break;

            case "göster":
                let myDocs = await Permissions.find({ user: ctx.options["göster"]["kullanıcı"] });
                if (ctx.options["göster"]["tür"]) myDocs = myDocs.filter(doc => doc.effect === ctx.options["göster"]["tür"]);
                if (myDocs.length === 0) return await ctx.send(`${mentioned} kullanıcısı için hiçbir izin bulunamadı.`, {
                    ephemeral: true
                });
                const permEmbed = new Discord.MessageEmbed().setDescription(myDocs.map(doc => stripIndent`
                ${doc.type} - ${doc.effect}
                Süresi: \`${doc.time - checkMins(doc.created)} dakika\`
                İzni veren kişi: <@${doc.executor}>
                `).join("\n●▬▬▬▬▬▬▬●\n"));
                await ctx.send({
                    embeds: [permEmbed]
                });
                break;

            default:
                break;
        }
    }
}
