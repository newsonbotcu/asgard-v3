const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const Jails = require('../../../../../MODELS/Moderation/mod_jail');
const IDS = require('../../../../../BASE/personels.json');

module.exports = class JailCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'unjail',
      description: 'Kişinin cezalandırmasını kaldırır.',
      options: [
        {
          type: CommandOptionType.USER,
          name: 'kullanıcı',
          description: 'Kullanıcıyı belirtiniz',
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
            id: IDS.jail,
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
    const guild = client.guilds.cache.get(ctx.guildID);
    if (!mentioned) return await ctx.send(`Kullanıcı bulunamadı`, {
        ephemeral: true
    });
    const Data = await Jails.findOne({ _id: mentioned.user.id });
    const embedd = new Discord.MessageEmbed().setDescription(`Kayt Bulunamadı!`)
    if (!Data) return await ctx.send({
      embeds: [embedd]
    });
    await mentioned.roles.add(Data.roles.map(rname => guild.roles.cache.find(role => role.name === rname)));
    await mentioned.roles.remove([roles.get("prisoner").value(), roles.get("denied").value()]);
    await Jails.deleteOne({ _id: mentioned.user.id });
    const responseEmbed = new Discord.MessageEmbed().setDescription(`${mentioned} kullanıcısı başarıyla jailden kurtarıldı!`);
    await ctx.send({
      embeds: [responseEmbed]
    });
  }
}
