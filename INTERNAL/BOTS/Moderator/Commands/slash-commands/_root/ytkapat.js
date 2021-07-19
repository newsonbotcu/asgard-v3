const { SlashCommand, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const IDS = require('../../../../../BASE/personels.json');

module.exports = class RegistryCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'ytkapat',
            description: 'Sunucudaki yetkileri kapatır',
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
        const guild = client.guilds.cache.get(ctx.guildID);
        await guild.roles.cache.get(roles.get("oluozan").value()).setPermissions(0);
        await guild.roles.cache.get(roles.get("oluozan2").value()).setPermissions(0);
        const embed = new Discord.MessageEmbed().setDescription("Oky Doky!").setColor('#7bf3e3');
        await ctx.send({
            embeds: [embed]
        });

    }
}