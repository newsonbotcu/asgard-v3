const Permissions = require("../../../../MODELS/Temprorary/permit");
const low = require('lowdb');
const { closeall } = require("../../../../HELPERS/functions");
const Discord = require('discord.js');
const overwrites = require("../../../../MODELS/Datalake/backup_overwrite");

class ChannelUpdate {
    constructor(client) {
        this.client = client;
    };

    async run(oldChannel, curChannel) {
        const client = this.client;
        if (curChannel.guild.id !== client.config.server) return;
        const utils = await low(client.adapters('utils'));
        const entry = await curChannel.guild.fetchAuditLogs({ type: "CHANNEL_OVERWRITE_CREATE" }).then(logs => logs.entries.first());
        if (entry.createdTimestamp <= Date.now() - 1000) return;
        if (entry.executor.id === client.user.id) return;
        if (entry.target.id !== curChannel.id) return;
        const permission = await Permissions.findOne({ user: entry.executor.id, type: "overwrite", effect: "channel" });
        if ((permission && (permission.count > 0)) || utils.get("root").value().includes(entry.executor.id)) {
            if (permission) await Permissions.updateOne({
                user: entry.executor.id,
                type: "overwrite",
                effect: "channel"
            }, { $inc: { count: -1 } });
            const newPerm = curChannel.permissionOverwrites.get(entry.extra.id);
            const document = await overwrites.findOne({ _id: curChannel.id });
            if (!document) {
                const newData = new overwrites({ _id: curChannel.id, overwrites: [] });
                await newData.save();
            }
            await overwrites.updateOne({ _id: curChannel.id }, { $push: { overwrites: newPerm } });
            client.extention.emit('Logger', 'Guard', entry.executor.id, "CHANNEL_OVERWRITE_CREATE", `${curChannel.name} isimli kanalda izin oluşturdu. Kalan izin sayısı ${permission.count - 1}`);
            return;
        }
        await Permissions.deleteOne({ user: entry.executor.id, type: "overwrite", effect: "channel" });
        await closeall(curChannel.guild, ["ADMINISTRATOR", "BAN_MEMBERS", "MANAGE_CHANNELS", "KICK_MEMBERS", "MANAGE_GUILD", "MANAGE_WEBHOOKS", "MANAGE_ROLES"]);
        const overwrits = await overwrites.findOne({ _id: curChannel.id });
        const exeMember = curChannel.guild.members.cache.get(entry.executor.id);
        client.extention.emit('Jail', exeMember, client.user.id, "KDE - İzin Oluşturma", "Perma", 0);
        client.extention.emit('Logger', 'KDE', entry.executor.id, "CHANNEL_OVERWRITE_CREATE", `${oldChannel.name} isimli kanalın izinleriyle oynadı`);
        await curChannel.overwritePermissions(overwrits.overwrites);
    }
}

module.exports = ChannelUpdate;