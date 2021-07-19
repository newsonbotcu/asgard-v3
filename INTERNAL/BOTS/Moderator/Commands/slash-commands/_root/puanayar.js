const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const IDS = require('../../../../../BASE/personels.json');

module.exports = class JailCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'puanayar',
            description: 'Puan sistemi ayarlama komutu',
            options: [
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: "yap",
                    description: "Puan ayarlamasını yapar",
                    options: [
                        {
                            type: CommandOptionType.ROLE,
                            name: "rol",
                            description: "Hangi rol için ayar yapılacağını seç",
                            required: true
                        },
                        {
                            type: CommandOptionType.INTEGER,
                            name: "puan",
                            description: "Role geçme puanı belirt",
                            required: true
                        },
                        {
                            type: CommandOptionType.INTEGER,
                            name: "süre",
                            description: "Rolde kalma süresi belirt (saat bazında)",
                            required: true
                        },
                        {
                            type: CommandOptionType.INTEGER,
                            name: "kayıt-puan",
                            description: "Kayıt başı alacağı puanı belirle",
                            required: true
                        },
                        {
                            type: CommandOptionType.INTEGER,
                            name: "invite-puan",
                            description: "Davet başı alacağı puanı belirle",
                            required: true
                        },
                        {
                            type: CommandOptionType.INTEGER,
                            name: "taglı-puan",
                            description: "Taglı başı alacağı puanı belirle",
                            required: true
                        },
                        {
                            type: CommandOptionType.INTEGER,
                            name: "yetkili-puan",
                            description: "Yetkili başı alacağı puanı belirle",
                            required: true
                        },
                        {
                            type: CommandOptionType.INTEGER,
                            name: "mesaj-puan",
                            description: "Mesaj başı alacağı puanı belirle",
                            required: true
                        },
                        {
                            type: CommandOptionType.INTEGER,
                            name: "ses-public-puan",
                            description: "Saat başı alacağı puanı belirle",
                            required: true
                        },
                        {
                            type: CommandOptionType.INTEGER,
                            name: "ses-diğer-puan",
                            description: "Saat başı alacağı puanı belirle",
                            required: true
                        }
                    ]
                },
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: "düzenle",
                    description: "Varolan ayarlamayı düzenler",
                    options: [
                        {
                            type: CommandOptionType.ROLE,
                            name: "rol",
                            description: "Hangi rol için ayar yapılacağını seç",
                            required: true
                        },
                        {
                            type: CommandOptionType.STRING,
                            name: "seçenek",
                            description: "Değiştireceğiniz değeri giriniz",
                            required: true,
                            choices: [
                                {
                                    name: "Rolü Geçme Puanı",
                                    value: "requiredPoint"
                                },
                                {
                                    name: "Rolde Kalma Süresi",
                                    value: "expiringHours"
                                },
                                {
                                    name: "Kayıt Puanı",
                                    value: "registry"
                                },
                                {
                                    name: "Davet Puanı",
                                    value: "invite"
                                },
                                {
                                    name: "Taglı Puanı",
                                    value: "tagged"
                                },
                                {
                                    name: "Yetkili Puanı",
                                    value: "authorized"
                                },
                                {
                                    name: "Mesaj Puanı",
                                    value: "message"
                                },
                                {
                                    name: "Public Ses Puanı",
                                    value: "voicePublicPerMinute"
                                },
                                {
                                    name: "Diğer Puanı Puanı",
                                    value: "voiceOtherPerMinute"
                                }
                            ]
                        },
                        {
                            type: CommandOptionType.INTEGER,
                            name: "değer",
                            description: "Yeni değeri giriniz",
                            required: true
                        }
                    ]
                },
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: "sil",
                    description: "Varolan bir ayarlamayı siler.",
                    options: [
                        {
                            type: CommandOptionType.STRING,
                            name: "rol",
                            description: "Ayarlamasını sileceğiniz rolü belirtiniz",
                            required: true
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
                        type: ApplicationCommandPermissionType.USER,
                        id: '479293073549950997',
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
        const userID = Object.values(ctx.options)[0];
        const guild = client.guilds.cache.get(ctx.guildID);
        const PuanConfig = await Points_config.findOne({ _id: Object.values(ctx.options)[0]["rol"] });
        switch (Object.keys(ctx.options)[0]) {
            case "yap":
                if (PuanConfig) return await ctx.send('Bu rol için ayarlama zaten mevcut.', {
                    ephemeral: true
                });
                await Points_config.create({
                    _id: ctx.options["yap"]["rol"],
                    requiredPoint: ctx.options["yap"]["puan"],
                    expiringHours: ctx.options["yap"]["süre"],
                    registry: ctx.options["yap"]["kayıt-puan"],
                    invite: ctx.options["yap"]["invite-puan"],
                    tagged: ctx.options["yap"]["taglı-puan"],
                    authorized: ctx.options["yap"]["yetkili-puan"],
                    message: ctx.options["yap"]["mesaj-puan"],
                    voicePublicPerMinute: ctx.options["yap"]["ses-public-puan"],
                    voiceOtherPerMinute: ctx.options["yap"]["ses-diğer-puan"],
                });
                break;

            case "düzenle":
                if (!PuanConfig) return await ctx.send('Bu rol için bir ayarlama daha yapılmamış.', {
                    ephemeral: true
                });
                await Points_config.updateOne({ _id: ctx.options["düzenle"]["rol"] }, { $set: { [ctx.options["düzenle"]["seçenek"]]: ctx.options["düzenle"]["değer"] } });
                break;

            case "sil":
                if (!PuanConfig) return await ctx.send('Bu rol için bir ayarlama daha yapılmamış.', {
                    ephemeral: true
                });
                await Points_config.deleteOne({ _id: ctx.options["sil"]["rol"] });
                break;
            default:
                break;
        }


    }
}
