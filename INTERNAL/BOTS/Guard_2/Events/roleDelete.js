const Permissions = require("../../../MODELS/Temprorary/permit");
const Roles = require("../../../MODELS/Datalake/backup_role");
const low = require('lowdb');
const Discord = require('discord.js');
const { closeall } = require("../../../HELPERS/functions");
const overwrites = require("../../../MODELS/Datalake/backup_overwrite");
const children = require('child_process');

class RoleCreate {
    constructor(client) {
        this.client = client;
    };

    async run(role) {
        const client = this.client;
        if (role.guild.id !== client.config.server) return;
        const entry = await role.guild.fetchAuditLogs({ type: 'ROLE_DELETE' }).then(logs => logs.entries.first());
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        if (entry.createdTimestamp <= Date.now() - 5000) return;
        if (entry.executor.id === client.user.id) return;
        const permission = await Permissions.findOne({ user: entry.executor.id, type: "delete", effect: "role" });
        if ((permission && (permission.count > 0)) || utils.get("root").value().includes(entry.executor.id)) {
            if (permission) await Permissions.updateOne({ user: entry.executor.id, type: "delete", effect: "role" }, { $inc: { count: -1 } });
            await Roles.deleteOne({ _id: role.id });
            client.extention.emit('Logger', 'Guard', entry.executor.id, "ROLE_DELETE", `${role.name} isimli rolü sildi. Kalan izin sayısı ${permission ? permission.count - 1 : "sınırsız"}`);
            return;
        }
        if (permission) await Permissions.deleteOne({ user: entry.executor.id, type: "delete", effect: "role" });
        closeall(role.guild, ["ADMINISTRATOR", "BAN_MEMBERS", "MANAGE_CHANNELS", "KICK_MEMBERS", "MANAGE_GUILD", "MANAGE_WEBHOOKS", "MANAGE_ROLES"]);
        const exeMember = role.guild.members.cache.get(entry.executor.id);
        client.extention.emit('Jail', exeMember, client.user.id, "KDE - Rol Silme", "Perma", 0);
        const roleData = await Roles.findOne({ _id: role.id });
        const newRole = await role.guild.roles.create({
            data: {
                name: roleData.name,
                color: roleData.color,
                hoist: roleData.hoist,
                mentionable: roleData.mentionable,
                position: roleData.rawPosition,
                permissions: roleData.bitfield
            }
        });
        const rolePath = await client.getPath(roles.value(), role.id);
        if (rolePath) roles.set(rolePath, newRole.id).write();
        await Roles.deleteOne({ _id: role.id });
        const newData = new Roles({
            _id: newRole.id,
            name: newRole.name,
            color: newRole.hexColor,
            hoist: newRole.hoist,
            mentionable: newRole.mentionable,
            rawPosition: newRole.rawPosition,
            bitfield: newRole.permissions
        });
        await newData.save();
        const overwrits = await overwrites.find();
        const roleFiltered = overwrits.filter(doc => doc.overwrites.some(o => o.id === role.id));
        for (let index = 0; index < roleFiltered.length; index++) {
            const document = roleFiltered[index];
            let docover = document.overwrites.find(o => o.id === role.id);
            const channel = role.guild.channels.cache.get(document._id);
            const options = {};
            new Discord.Permissions(docover.allow.bitfield).toArray().forEach(p => options[p] = true);
            new Discord.Permissions(docover.deny.bitfield).toArray().forEach(p => options[p] = false);
            await channel.updateOverwrite(newRole, options);
            await overwrites.updateOne({ _id: document._id }, { $pull: { overwrites: docover } });
            await overwrites.updateOne({ _id: document._id }, {
                $push: {
                    overwrites: {
                        id: newRole.id,
                        type: 'role',
                        allow: docover.allow,
                        deny: docover.deny
                    }
                }
            });
        }
        if (utils.get("ohal").value()) return;
        client.extention.emit('Logger', 'KDE', entry.executor.id, "ROLE_DELETE", `${role.name} isimli rolü sildi`);
        await utils.set("ohal", true).write();
        function Process(i) {
            var ls = children.exec(`pm2 start /home/${client.config.project}/${utils.get("dir").value()}/INTERNAL/BOTS/_CD/cd${i}.js`);
            ls.stdout.on('data', function (data) {
                console.log(data);
            });
            ls.stderr.on('data', function (data) {
                console.log(data);
            });
            ls.on('close', function (code) {
                if (code == 0)
                    console.log('Stop');
                else
                    console.log('Start');
            });
        }
        for (let index = 1; index < utils.get("CdSize").value() + 1; index++) {
            Process(index);
        }
    }
}

module.exports = RoleCreate;