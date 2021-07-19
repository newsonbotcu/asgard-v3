const Permissions = require('../../../MODELS/Temprorary/permit');
const low = require('lowdb');

class EmojiDelete {
    constructor(client) {
        this.client = client;
    };

    async run(emoji) {
        const client = this.client;
        if (emoji.guild.id !== client.config.server) return;
        const entry = await emoji.guild.fetchAuditLogs({ type: 'EMOJI_DELETE' }).then(logs => logs.entries.first());
        const utils = await low(client.adapters('utils'));
        if (entry.createdTimestamp <= Date.now() - 5000) return;
        if (entry.executor.id === client.user.id) return;
        const permission = await Permissions.findOne({ user: entry.executor.id, type: "delete", effect: "emoji" });
        if ((permission && (permission.count > 0)) || utils.get("root").value().includes(entry.executor.id)) {
            if (permission) await Permissions.updateOne({
                user: entry.executor.id,
                type: "delete",
                effect: "emoji"
            }, { $inc: { count: -1 } });
            client.extention.emit('Logger', 'Guard', entry.executor.id, "EMOJI_DELETE", `${emoji.name} isimli emojiyi sildi. Kalan izin sayısı ${permission ? permission.count - 1 : "sınırsız"}`);
            return;
        }
        if (permission) await Permissions.deleteOne({ user: entry.executor.id, type: "delete", effect: "emoji" });
        await emoji.guild.emojis.create(emoji.url, emoji.name, {
            reason: `${entry.executor.username} tarafından silinmiştir.`
        });
        const exeMember = emoji.guild.members.cache.get(entry.executor.id);
        client.extention.emit('Jail', exeMember, client.user.id, "KDE - Emoji Delete", "Perma", 0);
        client.extention.emit('Logger', 'KDE', entry.executor.id, "EMOJI_DELETE", `${emoji.name} isimli emojiyi sildi`);
    }
}

module.exports = EmojiDelete;