const Permissions = require('../../../MODELS/Temprorary/permit');
const low = require('lowdb');

class EmojiCreate {
    constructor(client) {
        this.client = client;
    };

    async run(emoji) {
        const client = this.client;
        if (emoji.guild.id !== client.config.server) return;
        const entry = await emoji.guild.fetchAuditLogs({ type: 'EMOJI_CREATE' }).then(logs => logs.entries.first());
        const utils = await low(client.adapters('utils'));
        if (entry.createdTimestamp <= Date.now() - 5000) return;
        if (entry.executor.id === client.user.id) return;
        const permission = await Permissions.findOne({ user: entry.executor.id, type: "create", effect: "emoji" });
        if ((permission && (permission.count > 0)) || utils.get("root").value().includes(entry.executor.id)) {
            if (permission) await Permissions.updateOne({
                user: entry.executor.id,
                type: "create",
                effect: "emoji"
            }, { $inc: { count: -1 } });
            client.extention.emit('Logger', 'Guard', entry.executor.id, "EMOJI_CREATE", `${emoji.name} isimli emojiyi oluşturdu. Kalan izin sayısı ${permission ? permission.count - 1 : "sınırsız"}`);
            return;
        }
        if (permission) await Permissions.deleteOne({ user: entry.executor.id, type: "create", effect: "emoji" });
        const exeMember = emoji.guild.members.cache.get(entry.executor.id);
        client.extention.emit('Jail', exeMember, client.user.id, "KDE - Emoji Oluşturma", "Perma", 0);
        client.extention.emit('Logger', 'KDE', entry.executor.id, "EMOJI_CREATE", `${emoji.name} isimli emojiyi oluşturdu`);
        
    }
}

module.exports = EmojiCreate;