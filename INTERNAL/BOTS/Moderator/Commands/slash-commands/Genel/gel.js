const { SlashCommand, CommandOptionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const IDS = require('../../../../../BASE/personels.json');
module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'gel',
            description: 'Kullanıcıyı yanınıza çekmek için izin alır',
            options: [
                {
                    type: CommandOptionType.USER,
                    name: 'kullanıcı',
                    description: 'Kullanıcıyı belirtiniz',
                    required: true
                }
            ],
            guildIDs: [IDS.guild],
            deferEphemeral: false
        });

        this.filePath = __filename;
    }

    async run(ctx) {
        const client = ctx.creator.client;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const channels = await low(client.adapters('channels'));
        const userID = Object.values(ctx.options)[0];
        const guild = client.guilds.cache.get(ctx.guildID);
        const mentioned = client.guilds.cache.get(ctx.guildID).members.cache.get(userID);
        const channel = client.guilds.cache.get(ctx.guildID).channels.cache.get(ctx.channelID)
        const emojis = await low(client.adapters('emojis'));
        if (!mentioned) return ctx.send(`Kullanıcı bulunamadı!`, {
            ephemeral: true
        });
        if (!mentioned.voice.channel) return await ctx.send(`Kullanıcı bir ses kanalında bulunmuyor!`, {
            ephemeral: true
        });
        if (!guild.members.cache.get(ctx.member.user.id).voice.channel) return await ctx.send(`Bir ses kanalında bulunmuyorsun!`, {
            ephemeral: true
        });
        await ctx.send(`Sevgili ${mentioned}, <@${ctx.member.user.id}> kanalına katılmanızı istiyor. Eğer gitmek istiyorsan bu kanala \`onayla @etiket/kullanıcıID\` yazman yeterli.`);

        const filter = (msg) => msg.author.id === mentioned.user.id;
        const collector = new Discord.MessageCollector(channel, filter, {
            time: 120000
        });
        collector.on("collect", async (message) => {
            if (message.content === `onay <@${mentioned.user.id}>` || message.content !== `onay ${mentioned.user.id}`) {
                if (!mentioned.voice.channel) return await channel.send(`Bir ses kanalında bulunmuyorsun.`);
                if (!guild.members.cache.get(ctx.member.user.id).voice.channel) return await channel.send("Komutu kullanan kişi artık bir ses kanalında bulunmuyor.");
                collector.stop("finished");
                await mentioned.voice.setChannel(guild.members.cache.get(ctx.member.user.id).voice.channel.id);
                await channel.send("Kullanıcının kanalına başarıyla taşındınız.");
            }
        });



    }
}
