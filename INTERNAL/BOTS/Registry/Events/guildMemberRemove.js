const low = require('lowdb');
class GuildMemberRemove {
    constructor(client) {
        this.client = client;
    }

    async run(member) {
        const client = this.client;
        if (member.guild.id !== client.config.server) return;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const pruneentry = await member.guild.fetchAuditLogs({ type: "MEMBER_PRUNE" }).then(logs => logs.entries.first());
        if (pruneentry && (pruneentry.createdTimestamp >= Date.now() - 5000)) {
            const removed = pruneentry.extra.removed;
            const days = pruneentry.extra.days;
            if (utils.get("root").value().includes(pruneentry.executor.id)) return client.extention.emit('Logger', 'MEMBER_PRUNE', entry.executor.id, "Quit", `${pruneentry.executor.username} ${days} günde ${removed} kadar aktif olmayan üyeyi sunucudan ${pruneentry.reason ? pruneentry.reason : "bilinmeyen"} sebeple çıkardı.`);
            await member.guild.members.ban(pruneentry.executor.id, { reason: `${days} günde ${removed} kadar aktif olmayan üyeyi sunucudan ${pruneentry.reason ? pruneentry.reason : "bilinmeyen"} sebeple çıkardı.` });
            return;
        }
        const entry = await member.guild.fetchAuditLogs({ type: "MEMBER_KICK" }).then(logs => logs.entries.first());
        if ((entry.target.id === member.user.id) && entry.createdTimestamp >= Date.now() - 1000) {
            const exeMember = member.guild.members.cache.get(entry.executor.id);
            if (member.user.bot && entry.executor.bot) return;
            if (exeMember.roles.cache.has(roles.get("root").value()) || utils.get("root").value().includes(entry.executor.id)) return client.extention.emit('Logger', 'KDE', entry.executor.id, "MEMBER_KICK", `${member.user.username} kullanıcısını sunucudan attı`);
            client.extention.emit("Jail", exeMember, client.user.id, "KDE - Üye Atma", "Perma", 1);
            client.extention.emit('Logger', 'KDE', entry.executor.id, "MEMBER_KICK", `${member.user.username} kullanıcısını sunucudan attı`);
            return;
        }
        client.extention.emit('Logger', 'Registry', member.user.id, "MEMBER_REMOVE", `${member.user.username} adlı kullanıcı sunucudan çıkış yaptı.`);
    }
}
module.exports = GuildMemberRemove;