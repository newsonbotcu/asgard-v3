const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const IDS = require('../../../../../BASE/personels.json');
module.exports = class BanCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'kanal',
      description: 'Kanal taşıma/çekme/susturma komutu',
      options: [
        {
          type: CommandOptionType.STRING,
          name: 'işlem',
          description: 'Yapılacak işlem',
          required: true,
          choices: [
            {
              name: "Taşı",
              value: "tasi"
            },
            {
              name: "Sustur",
              value: "sustur"
            },
            {
              name: "Çek",
              value: "cek"
            }
          ]
        },
        {
          type: CommandOptionType.CHANNEL,
          name: 'kanal',
          description: 'Kanalı belirtiniz',
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
            id: IDS.edit,
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
    const guild = client.guilds.cache.get(ctx.guildID);
    const userID = Object.values(ctx.options)[0];
    const mentioned = guild.members.cache.get(userID);
    if (!mentioned) return await ctx.send(`${emojis.get("kullaniciyok").value()} Kullanıcı bulunamadı!`, {
      ephemeral: true
    });
    const channel = guild.channels.cache.get(ctx.options["kanal"]);
    if (!channel) return await ctx.send(`Kanal bulunamadı!`, {
      ephemeral: true
    });
    switch (ctx.options["işlem"]) {
      case "tasi":
        if (channel.type !== "voice") return await ctx.send(`Belirttiğin kanal bir ses kanalı olmalı!`, {
          ephemeral: true
        });
        if (!mentioned.voice.channel) return await ctx.send(`Bir ses kanalında bulunmalısın!`, {
          ephemeral: true
        });
        await mentioned.voice.channel.members.forEach(async mem => {
          await mem.voice.setChannel(channel.id);
        });
        break;
      case "sustur":
        if (channel.type === "voice") {
          if (!mentioned.voice.channel) return await ctx.send(`Bir ses kanalında bulunmalısın!`, {
            ephemeral: true
          });
          if (channel.permissionOverwrites.get(guild.roles.everyone.id).deny.toArray().includes("SPEAK")) {
            await channel.updateOverwrite(guild.roles.everyone.id, {
              SPEAK: null
            });
          } else {
            await channel.updateOverwrite(guild.roles.everyone.id, {
              SPEAK: false
            });
          }
          await channel.members.forEach(async m => {
            await m.voice.setChannel(channel.id);
          });
        } else {
          if (channel.permissionOverwrites.get(guild.roles.everyone.id).deny.toArray().includes("SEND_MESSAGES")) {
            await channel.updateOverwrite(guild.roles.everyone.id, {
              SEND_MESSAGES: null
            });
          } else {
            await channel.updateOverwrite(guild.roles.everyone.id, {
              SEND_MESSAGES: false
            });
            await channel.updateOverwrite(IDS.owner, {
              SEND_MESSAGES: true
            });
          }
        }
        break;
      case "cek":
        if (channel.type !== "voice") return await ctx.send(`Belirttiğin kanal bir ses kanalı olmalı!`, {
          ephemeral: true
        });
        if (!mentioned.voice.channel) return await ctx.send(`Bir ses kanalında bulunmalısın!`, {
          ephemeral: true
        });
        await channel.members.forEach(async mem => {
          await mem.voice.setChannel(mentioned.voice.channel.id);
        });
        break;
      default:
        break;
    }
  }
}
