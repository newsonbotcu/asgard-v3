const Component = require("../../../Base/Component");
const Discord = require('discord.js');
const low = require('lowdb');
const Task_profile = require("../../../../../MODELS/Economy/Task_profile");
const { sayi, checkDays } = require("../../../../../HELPERS/functions");
const { stripIndent } = require("common-tags");
class RolSeçim extends Component {
    constructor(client) {
        super(client, {
            name: "task_excuse",
            accaptedPerms: [],
            cooldown: 180000,
            enabled: true,
            ownerOnly: false,
            rootOnly: false,
            onTest: false,
            adminOnly: false
        });
    }

    async run(ctx) {
        const client = this.client;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const channels = await low(client.adapters('channels'));
        const emojis = await low(client.adapters('emojis'));
        const guild = client.guilds.cache.get(ctx.guildID);
        const mentioned = guild.members.cache.get(ctx.user.id);
        const profiles = await Task_profile.find();
        const excuseCount = profiles.map(p => p.excuses.length).reduce((a, c) => a + c, 0);
        const mazeretlog = guild.channels.cache.get(channels.get("excuse").value());
        const myProfile = await Task_profile.findOne({ _id: mentioned.user.id });
        if (myProfile.excuses.filter(ex => checkDays(ex.created) < 15).length >= 1) return await ctx.send(`İzin sınırını aştın!`, {
            ephemeral: true
        });
        const channel = await guild.channels.create(`mazeret-${excuseCount + 1}`, {
            type: 'text',
            topic: `${mentioned.displayName} (${mentioned.roles.highest})`,
            nsfw: false,
            parent: mazeretlog.parentID
        });
        await channel.updateOverwrite(mentioned.user.id, {
            VIEW_CHANNEL: true
        });
        const filter_1 = (msg) => msg.author.id === mentioned.user.id;
        const collector_1 = new Discord.MessageCollector(channel, filter_1, {
            time: 120000
        });
        let reeson;
        await channel.send(`Selam ${mentioned}!, mazeret sebebini öğrenebilir miyim?`);
        collector_1.on("collect", (message) => {
            reeson = message.content;
            collector_1.stop("finished");
        });
        collector_1.on("end", async (collected, reason) => {
            if (reason !== "finished") {
                await channel.send("Bu işlem zaman aşımına uğradı!");
                setTimeout(async () => {
                    await channel.delete();
                }, 5000);
                return;
            } else {
                await channel.send(`Kaç gün sonra tekrardan aktif olacağını yazar mısın?`);
                const collector_2 = new Discord.MessageCollector(channel, filter_1, {
                    time: 12000
                });
                collector_2.on("collect", async (message) => {
                    if (!sayi(message.content)) return await channel.send("Bir sayı girmelisin!");
                    if (Number(message.content) > 3) return await message.channel.send("Üç günden fazla sürecek bir izin almak için **Loki** permine sahip insanlara ulaş.");
                    await Task_profile.updateOne({ _id: mentioned.user.id }, {
                        $push: {
                            excuses: {
                                created: new Date(),
                                duration: Number(message.content),
                                reason: reeson
                            }
                        }
                    });
                    collector_2.stop("finished");
                    await channel.send("Mazeretin başarıyla oluşturuldu!");
                    setTimeout(async () => {
                        await channel.delete();
                    }, 5000);
                    await mazeretlog.send(new Discord.MessageEmbed().setDescription(stripIndent`
                    Kulllanıcı: ${mentioned}
                    Sebep: ${reeson}
                    Süre: ${message.content} gün
                    `));
                });
                collector_2.on("end", async (coll, rea) => {
                    if (rea !== "finished") {
                        await channel.send("Bu işlem zaman aşımına uğradı!");
                        setTimeout(async () => {
                            await channel.delete();
                        }, 5000);
                        return;
                    }
                });
            }
        });

    }
}

module.exports = RolSeçim;