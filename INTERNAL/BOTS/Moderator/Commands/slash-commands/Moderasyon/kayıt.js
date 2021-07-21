const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const nameData = require('../../../../../MODELS/Datalake/membership');
const { sayi, comparedate } = require('../../../../../HELPERS/functions');
const IDS = require('../../../../../BASE/personels.json');
const Task_profile = require('../../../../../MODELS/Economy/Task_profile');

module.exports = class RegistryCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'kayıt',
            description: 'Kişiyi kaydeder',
            options: [
                {
                    type: CommandOptionType.MENTIONABLE || CommandOptionType.USER,
                    name: 'kullanıcı',
                    description: 'Kullanıcıyı belirtiniz',
                    required: true
                },
                {
                    type: CommandOptionType.STRING,
                    name: 'cinsiyet',
                    description: 'Cinsiyetini belirtiniz',
                    required: true,
                    choices: [
                        {
                            name: "Erkek",
                            value: "Male"
                        },
                        {
                            name: "Kız",
                            value: "Female"
                        }
                    ]
                },
                {
                    type: CommandOptionType.STRING,
                    name: 'isim',
                    description: 'İsmini belirtiniz',
                    required: true
                },
                {
                    type: CommandOptionType.INTEGER,
                    name: 'yaş',
                    description: 'Yaşını belirtiniz',
                    required: true
                }
            ],
            deferEphemeral: false,
            defaultPermission: false,
            guildIDs: [IDS.guild],
            permissions: {
                [IDS.guild]: [
                    {
                        type: ApplicationCommandPermissionType.ROLE,
                        id: IDS.registry,
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
        const userID = Object.values(ctx.options)[0];
        const mentioned = client.guilds.cache.get(ctx.guildID).members.cache.get(userID);
        if (!mentioned) return await ctx.send(`Kullanıcı bulunamadı`, {
            ephemeral: true
        });
        const errEmbed2 = new Discord.MessageEmbed().setDescription(`Sanırım bu üye zaten kayıtlı!`);
        if (!mentioned.roles.cache.has(roles.get("welcome").value()) && (mentioned.roles.cache.size > 1)) return ctx.send({ embeds: [errEmbed2] });
        if (utils.get("taglıAlım").value() && !mentioned.user.username.includes(client.config.tag)) {
            if (!mentioned.roles.cache.has(roles.get("vip").value()) && !mentioned.roles.cache.has(roles.get("booster").value())) {
                const eEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setDescription(`Üzgünüm, ama henüz taglı alımdayız. ${mentioned} kullanıcısında vip veya booster rolü olmadığı koşulda onu içeri alamam..`)
                return ctx.send({
                    embeds: [eEmbed]
                });
            }
        }
        const sex = ctx.options["cinsiyet"];
        const name = ctx.options["isim"];
        const age = ctx.options["yaş"];
        if (!sayi(age)) return ctx.send(`Geçerli bir yaş girmelisin!`, {
            ephemeral: true
        });
        const nameFixed = name.split(' ').map(i => i[0].toUpperCase() + i.slice(1).toLowerCase()).join(' ');
        await mentioned.roles.add(roles.get(sex).value().concat(roles.get("member").value()));
        await mentioned.roles.remove(roles.get("welcome").value());
        let point = '✧';
        if (client.config.tag.some(tag => mentioned.user.username.includes(tag))) {
            await mentioned.roles.add(roles.get("crew").value());
            point = client.config.tag[0];
        }
        await mentioned.setNickname(`${point} ${nameFixed} | ${age}`);
        const registry = await nameData.findOne({ _id: mentioned.user.id });
        if (!registry) {
            const data = new nameData({
                _id: mentioned.user.id,
                executor: ctx.user.id,
                created: new Date(),
                name: nameFixed,
                age: age,
                sex: sex
            });
            await data.save();
        }
        const registryDatas = await nameData.find({ executor: ctx.user.id });
        const total = registryDatas.length || 1;
        const myEmbed = new Discord.MessageEmbed().setDescription(`${mentioned} kişisinin kaydı <@${ctx.user.id}> tarafından gerçekleştirildi.\nBu kişinin kayıt sayısı: \`${total}\``);
        await ctx.send({
            embeds: [myEmbed]
        });
        const TaskData = await Task_profile.findOne({ _id: ctx.user.id });
        if (TaskData && TaskData.active.some(task => task.type === "registry")) {
            const regTask = TaskData.tasks.find(task => task.type === "registry");
            const currentRegs = registryDatas.filter(data => comparedate(data.created) <= comparedate(regTask.created));
            if (currentRegs.length >= regTask.count) {
                await Task_profile.updateOne({ _id: ctx.user.id }, { $pull: { active: regTask } });
                await Task_profile.updateOne({ _id: ctx.user.id }, { $push: { done: regTask } });
            }
        }
    }
}
