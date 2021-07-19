const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const children = require("child_process");
const nameData = require('../../../../../MODELS/Datalake/membership');
const IDS = require('../../../../../BASE/personels.json');

module.exports = class JailCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'tantoony',
            description: 'tantoony only',
            options: [
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: 'eval',
                    description: 'Dikkat et yavrum',
                    options: [
                        {
                            type: CommandOptionType.STRING,
                            name: "tür",
                            description: "eval türü",
                            required: true,
                            choices: [
                                {
                                    name: "sync",
                                    value: "sync"
                                },
                                {
                                    name: "async",
                                    value: "async"
                                }
                            ]
                        },
                        {
                            type: CommandOptionType.STRING,
                            name: "kod",
                            description: "yazacağın kod",
                            required: true
                        }
                    ]
                },
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: 'pm2',
                    description: 'pm2 komutları',
                    options: [
                        {
                            type: CommandOptionType.STRING,
                            name: "komut",
                            description: "komutu belirtiniz",
                            required: true,
                        }
                    ]
                },
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: 'calm-down',
                    description: 'Rol dağıtma botları',
                    options: [
                        {
                            type: CommandOptionType.STRING,
                            name: 'işlem',
                            description: 'Rol dağıtma botları',
                            choices: [
                                {
                                    name: "aç",
                                    value: "start"
                                },
                                {
                                    name: "kapat",
                                    value: "delete"
                                }
                            ],
                            required: true
                        }
                    ]
                },
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: 'ohal',
                    description: 'Rol güncellemeleri',
                    options: [
                        {
                            type: CommandOptionType.BOOLEAN,
                            name: 'işlem',
                            description: 'Rol dağıtma botları',
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
        const channel = guild.channels.cache.get(ctx.channelID);
        function clean(text) {
            if (typeof (text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            else return text;
        }
        switch (Object.keys(ctx.options)[0]) {
            case "eval":
                if (Object.values(ctx.options['eval'])[0] === 'sync') {
                    try {
                        let evaled = eval(Object.values(ctx.options['eval'])[1]);
                        if (typeof evaled !== "string")
                            evaled = require("util").inspect(evaled);

                        await ctx.send(`\`\`\`xl\n${clean(evaled)}\`\`\``, { ephemeral: true });
                    } catch (err) {
                        await ctx.send(`\`\`\`xl\n${clean(err)}\`\`\``, { ephemeral: true });
                    }
                } else {
                    try {
                        let evaled = eval("(async () => {" + Object.values(ctx.options['eval'])[1] + "})()");
                        if (typeof evaled !== "string")
                            evaled = require("util").inspect(evaled);

                        await ctx.send(`\`\`\`xl\n${clean(evaled)}\`\`\``, { ephemeral: true });
                    } catch (err) {
                        await ctx.send(`\`\`\`xl\n${clean(err)}\`\`\``, { ephemeral: true });
                    }
                }
                break;

            case "pm2":
                if (Object.values(ctx.options['pm2'])[0].startsWith('logs')) return;
                const ls = children.exec(`pm2 ${Object.values(ctx.options['pm2'])[0]}`);
                ls.stdout.on('data', function (data) {
                    ctx.send(`\`\`\`${data.slice(0, 1990)}...\`\`\``);
                });
                ls.stderr.on('data', function (data) {
                    ctx.send(`\`\`\`${data.slice(0, 1990)}...\`\`\``);
                });
                setTimeout(() => {
                    ls.kill();
                }, 100);
                break;

            case "calm-down":
                function Process(i) {
                    var ls = children.exec(`pm2 ${Object.values(ctx.options['calm-down'])[0]} /home/${client.config.project}/${utils.get("dir").value()}/INTERNAL/BOTS/_CD/cd${i}.js`);
                    ls.stdout.on('data', function (data) {
                        console.log(data);
                    });
                    ls.stderr.on('data', function (data) {
                        console.log(data);
                    });
                    ls.on('close', function (code) {
                        if (code == 0)
                            console.log('Stop');
                        else
                            console.log('Start');
                    });
                }
                for (let index = 1; index < utils.get("CdSize").value() + 1; index++) {
                    Process(index);
                }
                await ctx.send(`Başarılı!`);
                break;

            case "ohal":
                await utils.set('ohal', Object.values(ctx.options['ohal'])[0]).write();
                if (utils.get("ohal").value()) {
                    await ctx.send(`Rol senktronizasyonu durduruldu.`);
                    const names = await nameData.find();
                    guild.members.cache.filter(m => !names.map(doc => doc._id).includes(m.user.id)).forEach(m => m.roles.add(roles.get("welcome").value()));
                } else {
                    await ctx.send(`Rol senktronizasyonu başlatıldı.`);
                }
                break;

            default:
                break;
        }
    }
}
