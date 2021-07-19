const { SlashCommand, CommandOptionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const afkdata = require('../../../../../MODELS/Datalake/afk');
module.exports = class AFKCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'afk',
            description: 'afk ayarlamak için kullanılır.',
            options: [
                {
                    type: CommandOptionType.STRING,
                    name: 'sebep',
                    description: 'sebep belirtiniz',
                    required: true
                }
            ],
            deferEphemeral: false,
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
        const system = await afkdata.findOne({ _id: ctx.user.id });
        if (!system) {
            try {
                let sex = new afkdata({
                    _id: ctx.user.id,
                    reason: Object.values(ctx.options)[0],
                    created: new Date(),
                    inbox: []
                });
                await sex.save();
            } catch (error) {
                console.log(error);
            }
            const embed = new Discord.MessageEmbed().setColor('#2f3136').setDescription(`${emojis.get("pando1").value()} Başarıyla Ayarlandı!`);
            await ctx.send({
                embeds: [embed]
            });
        } else return;
    }
}
