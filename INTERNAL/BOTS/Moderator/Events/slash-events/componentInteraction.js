const Discord = require('discord.js');
const low = require('lowdb');

module.exports = class {

    constructor(client) {
        this.client = client;
    }

    async run(ctx) {
        const client = this.client;
        if (ctx.guildID !== client.config.server) return;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        let command = ctx.customID;
        let cmd;
        if (client.buttons.has(command)) {
            cmd = client.buttons.get(command);
        } else return;
        const embed = new Discord.MessageEmbed();
        const member = client.guild.members.cache.get(ctx.user.id);
        if (!cmd.config.enabled) return;
        if (cmd.config.ownerOnly && (ctx.user.id !== client.config.owner)) return await ctx.send(`Bu butonu sadece ${client.owner} kullanabilir.`, {
            ephemeral: true
        });
        if (cmd.config.onTest && !utils.get("helpers").value().includes(ctx.user.id) && (ctx.user.id !== client.config.owner)) return ctx.send(`Bu buton henüz **test aşamasındadır**.`, {
            ephemeral: true
        });
        if (cmd.config.rootOnly && !utils.get("mod").value().includes(ctx.user.id) && (ctx.user.id !== client.config.owner)) return ctx.send(`Bu butonu sadece **yardımcılar** kullanabilir.`, {
            ephemeral: true
        });
        if (cmd.config.adminOnly && !ctx.member.permissions.has("MANAGE_ROLES") && (ctx.user.id !== client.config.owner)) return ctx.send(`Bu butonu sadece **yöneticiler** kullanabilir.`, {
            ephemeral: true
        });
        if (cmd.info.channel & client.guild.channels.cache.get(channels.get(cmd.info.channel).value()) && (ctx.channelID !== channels.get(cmd.info.channel).value())) return ctx.send(`Bu butonu ${ctx.guild.channels.cache.get(channels.get(cmd.info.channel).value())} kanalında kullanmayı dene!`, {
            ephemeral: true
        });
        const requiredRoles = cmd.info.accaptedPerms || [];
        let allowedRoles = [];
        await requiredRoles.forEach(rolValue => {
            allowedRoles.push(client.guild.roles.cache.get(roles.get(rolValue).value()))
        });
        let deyim = `Bu butonu kullanabilmek için ${allowedRoles[0]} rolüne sahip olmalısın!`;
        if (allowedRoles.length > 1) deyim = `Bu butonu kollanabilmek için aşağıdaki rollerden birisine sahip olmalısın:\n${allowedRoles.join(`\n`)}`;
        if ((allowedRoles.length >= 1) && !allowedRoles.some(role => member.roles.cache.has(role.id)) && !client.guild.members.cache.get(ctx.user.id).permissions.has("ADMINISTRATOR") && (ctx.user.id !== client.config.owner)) {
            return ctx.send({
                embeds: [embed.setDescription(deyim).setColor('#2f3136')],
                ephemeral: true
            });
        }
        let uCooldown = client.cmdCoodown[ctx.user.id];
        if (!uCooldown) {
            client.cmdCoodown[ctx.user.id] = {};
            uCooldown = client.cmdCoodown[ctx.user.id];
        }
        let time = uCooldown[cmd.info.name] || 0;
        if (time && (time > Date.now())) return await ctx.send(`Komutu tekrar kullanabilmek için lütfen **${Math.ceil((time - Date.now()) / 1000)}** saniye bekle!`, {
            ephemeral: true 
        });

        client.logger.log(`[(${ctx.user.id})] ${ctx.user.username} ran BUTTON [${cmd.info.name}]`, "cmd");
        try {
            cmd.run(ctx);
        } catch (e) {
            console.log(e);
        }
    }
}