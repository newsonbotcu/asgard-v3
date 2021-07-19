const Permissions = require('../../../MODELS/Datalake/permit');
const low = require('lowdb');

class EmojiUpdate {
    constructor(client) {
        this.client = client;
    };

    async run(oldEmoji, curEmoji) {
        const client = this.client;
        if (curEmoji.guild.id !== client.config.server) return;
        const entry = await curEmoji.guild.fetchAuditLogs({ type: 'EMOJI_UPDATE' }).then(logs => logs.entries.first());
        const utils = await low(client.adapters('utils'));
        if (entry.createdTimestamp <= Date.now() - 5000) return;
        if (entry.executor.id === client.user.id) return;
        const permission = await Permissions.findOne({ user: entry.executor.id, type: "update", effect: "emoji" });
        if ((permission && (permission.count > 0)) || utils.get("root").value().includes(entry.executor.id)) {
            if (permission) await Permissions.updateOne({
                user: entry.executor.id,
                type: "update",
                effect: "emoji"
            }, { $inc: { count: -1 } });
            client.extention.emit('Logger', 'Guard', entry.executor.id, "EMOJI_UPDATE", `${oldEmoji.name} isimli emojiyi yeniledi. Kalan izin sayısı ${permission ? permission.count - 1 : "sınırsız"}`);
            return;
        }
        if (permission) await Permissions.deleteOne({ user: entry.executor.id, type: "update", effect: "emoji" });
        const emoji = await curEmoji.edit({
            name: oldEmoji.name,
            roles: oldEmoji.roles
        }, `${entry.executor.username} Tarafından değiştirilmeye çalışıldı`);
        const exeMember = curEmoji.guild.members.cache.get(entry.executor.id);
        client.extention.emit('Jail', exeMember, client.user.id, "KDE - Emoji Yenileme", "Perma", 0);
        client.extention.emit('Logger', 'KDE', entry.executor.id, "EMOJI_UPDATE", `${oldEmoji.name} isimli emojiyi yeniledi`);

    }
}

module.exports = EmojiUpdate;