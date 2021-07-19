const Permissions = require('../../../MODELS/Temprorary/permit');
const Punishments = require('../../../MODELS/StatUses/stat_crime');
const low = require('lowdb');
const { checkDays } = require('../../../HELPERS/functions');

class GuildBanAdd {
    constructor(client) {
        this.client = client;
    };

    async run(guild, user) {
        const client = this.client;
        if (guild.id !== client.config.server) return;
        const entry = await guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD' }).then(logs => logs.entries.first());
        const utils = await low(client.adapters('utils'));
        if (entry.createdTimestamp <= Date.now() - 5000) return;
        if (entry.executor.id === client.user.id) return;
        if (entry.executor.bot) return;
        
        const banlogs = await Punishments.find();
        const banlog = banlogs.filter(log => log.records.some(record => (record.type === "Perma") && (record.executor === entry.executor.id) && (record.punish === "Ban") && (checkDays(record.created) <= 1)));
        const permission = await Permissions.findOne({ user: entry.executor.id, type: "ban", effect: "member" });
        if ((permission && (permission.count > 0)) || utils.get("root").value().includes(entry.executor.id) || (banlog.length < 5)) {
            if (permission) await Permissions.updateOne({ user: entry.executor.id, type: "ban", effect: "member" }, { $inc: { count: -1 } });
            const peer = {
                reason: entry.reeason ? entry.reason : "Belirtilmemiş",
                executor: entry.executor.id,
                punish: "Ban",
                type: "Perma",
                duration: 0,
                created: new Date()
            };
            const records = await Punishments.findOne({ _id: user.id });
            if (!records) {
                const record = new Punishments({ _id: user.id, records: [] });
                await record.save();
            }
            await Punishments.updateOne({ _id: user.id }, { $push: { records: peer } });
            client.extention.emit('Logger', 'Guard', entry.executor.id, "MEMBER_BAN_ADD", `${user.username} kulllanıcısını banladı. Kalan izin sayısı ${permission ? permission.count - 1 : "sınırsız"}`);
            return;
        }
        if (permission) await Permissions.deleteOne({ user: entry.executor.id, type: "ban", effect: "member" });
        await guild.members.unban(user.id, "Sağ Tık Ban");
        const exeMember = guild.members.cache.get(entry.executor.id);
        client.extention.emit('Jail', exeMember, client.user.id, "KDE - Sağ Tık Ban", "Perma", 0);
        client.extention.emit('Logger', 'KDE', entry.executor.id, "MEMBER_BAN_ADD", `${user.username} isimli kullanıcıyı banladı`);

    }
}

module.exports = GuildBanAdd;