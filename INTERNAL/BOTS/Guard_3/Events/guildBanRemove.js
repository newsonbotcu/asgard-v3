const Permissions = require('../../../MODELS/Temprorary/permit');
const Punishments = require('../../../MODELS/StatUses/stat_crime');
const low = require('lowdb');

class GuildBanAdd {
    constructor(client) {
        this.client = client;
    };

    async run(guild, user) {
        const client = this.client;
        if (guild.id !== client.config.server) return;
        const entry = await guild.fetchAuditLogs({ type: 'MEMBER_BAN_REMOVE' }).then(logs => logs.entries.first());
        const utils = await low(client.adapters('utils'));
        if (entry.createdTimestamp <= Date.now() - 5000) return;
        if (entry.executor.id === client.user.id) return;
        if (entry.executor.bot) return;
        const permission = await Permissions.findOne({ user: entry.executor.id, type: "unban", effect: "member" });
        if ((permission && (permission.count > 0)) || utils.get("root").value().includes(entry.executor.id)) {
            if (permission) await Permissions.updateOne({
                user: entry.executor.id,
                type: "unban",
                effect: "member"
            }, { $inc: { count: -1 } });
            const peer = {
                reason: entry.reeason ? entry.reason : "Belirtilmemiş",
                executor: entry.executor.id,
                type: "UnBan",
                created: new Date()
            };
            const records = await Punishments.findOne({ _id: user.id });
            if (!records) {
                const record = new Punishments({ _id: user.id, records: [] });
                await record.save();
            }
            await Punishments.updateOne({ _id: user.id }, { $push: { records: peer } });
            client.extention.emit('Logger', 'Guard', entry.executor.id, "MEMBER_BAN_REMOVE", `${user.username} isimli kullanıcının banını kaldırdı. Kalan izin sayısı ${permission ? permission.count - 1 : "sınırsız"}`);
            return;
        }
        if (permission) await Permissions.deleteOne({ user: entry.executor.id, type: "unban", effect: "member" });
        await guild.members.ban(user.id, { reason: "Sağ Tık UnBan" });
        const exeMember = guild.members.cache.get(entry.executor.id);
        client.extention.emit('Jail', exeMember, client.user.id, "KDE - Sağ Tık UnBan", "Perma", 0);
        client.extention.emit('Logger', 'KDE', entry.executor.id, "MEMBER_BAN_REMOVE", `${user.username} isimli kullanıcının banını kaldırdı`);

    }
}

module.exports = GuildBanAdd;