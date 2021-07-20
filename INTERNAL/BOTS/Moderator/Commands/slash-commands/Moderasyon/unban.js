const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const Bans = require('../../../../../MODELS/Moderation/mod_ban');
const IDS = require('../../../../../BASE/personels.json');

module.exports = class JailCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'unban',
      description: 'Kişinin banını kaldırır.',
      options: [
        {
          type: CommandOptionType.STRING,
          name: 'kullanıcı-id',
          description: "Kullanıcının ID'sini belirtiniz",
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
            id: IDS.ban,
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
    const mentioned = await client.guilds.cache.get(ctx.guildID).fetchBan(userID);
    const guild = client.guilds.cache.get(ctx.guildID);
    const errEmbed = new Discord.MessageEmbed().setDescription(`${emojis.get("kullaniciyok").value()} Ban bulunamadı!`).setColor('#2f3136');
    const BanDoc = await Bans.findOne({ _id: mentioned.user.id });
    const emptyError = new Discord.MessageEmbed().setDescription(`${emojis.get("missingPerms").value()} Bu kullanıcının banını kaldıracak yetkiye sahip değilsin!`)
    if (BanDoc && guild.members.cache.get(BanDoc.executor).roles.highest.rawPosition > guild.members.cache.get(ctx.user.id).roles.highest.rawPosition) return await ctx.send({
      embeds: [emptyError],
      ephemeral: true
    });
    if (BanDoc) await Bans.deleteOne({ _id: mentioned.user.id });
    await guild.members.unban(mentioned.user.id, `${ctx.user.username} tarafından kaldırıldı`);
    if (!mentioned) return await ctx.send({
      embeds: [errEmbed],
      ephemeral: true
    });
    const responseEmbed = new Discord.MessageEmbed().setDescription(`<@${mentioned.user.id}> kullanıcısının banı başarıyla kaldırıldı!`);
    await ctx.send({
      embeds: [responseEmbed]
    });
  }
}
