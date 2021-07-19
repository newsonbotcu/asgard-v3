const Permissions = require("../../../MODELS/Datalake/permit");
const Roles = require("../../../MODELS/Datalake/backup_role");
const low = require('lowdb');
const { closeall } = require("../../../HELPERS/functions");
const MemberRoles = require('../../../MODELS/Datalake/backup_member');
const Discord = require('discord.js');
class RoleUpdate {
    constructor(client) {
        this.client = client;
    };
    async run(oldRole, curRole) {
        const client = this.client;
        if (curRole.guild.id !== client.config.server) return;
        const entry = await curRole.guild.fetchAuditLogs({ type: 'ROLE_UPDATE' }).then(logs => logs.entries.first());
        const utils = await low(client.adapters('utils'));
        if (entry.createdTimestamp <= Date.now() - 5000) return;
        if (entry.executor.id === client.user.id) return;
        const permission = await Permissions.findOne({ user: entry.executor.id, type: "update", effect: "role" });
        if ((permission && (permission.count > 0)) || utils.get("root").value().includes(entry.executor.id)) {
            if (permission) await Permissions.updateOne({ user: entry.executor.id, type: "update", effect: "role" }, { $inc: { count: -1 } });
            await Roles.updateOne({ _id: curRole.id }, {
                name: curRole.name,
                color: curRole.hexColor,
                hoist: curRole.hoist,
                mentionable: curRole.mentionable,
                rawPosition: curRole.rawPosition,
                bitfield: curRole.permissions.bitfield
            });
            if (oldRole.name !== curRole.name) {
                await MemberRoles.updateMany({ roles: oldRole.name }, { $push: { roles: curRole.name } });
                await MemberRoles.updateMany({ roles: oldRole.name }, { $pull: { roles: oldRole.name } });
            }
            client.extention.emit('Logger', 'Guard', entry.executor.id, "ROLE_UPDATE", `${oldRole.name} isimli rolü güncelledi. Kalan izin sayısı ${permission ? permission.count - 1 : "sınırsız"}`);
            return;
        }
        await closeall(curRole.guild, ["ADMINISTRATOR", "BAN_MEMBERS", "MANAGE_CHANNELS", "KICK_MEMBERS", "MANAGE_GUILD", "MANAGE_WEBHOOKS", "MANAGE_ROLES"]);
        const exeMember = curRole.guild.members.cache.get(entry.executor.id);
        client.extention.emit('Jail', exeMember, client.user.id, "KDE - Rol Güncelleme", "Perma", 0);
        await Permissions.deleteOne({ user: entry.executor.id, type: "update", effect: "role" });
        const data = await Roles.findOne({ _id: curRole.id });
        await curRole.edit({
            name: data.name,
            color: data.hexColor,
            hoist: data.hoist,
            mentionable: data.mentionable,
            position: data.rawPosition,
            permissions: new Discord.Permissions(data.bitfield)
        });
        client.extention.emit('Logger', 'KDE', entry.executor.id, "ROLE_UPDATE", `${oldRole.name} isimli rolü yeniledi`);

    }
}
module.exports = RoleUpdate;