const ChatMuted = require('../MODELS/Moderation/mod_cmute');
const low = require('lowdb');

class PermaBanEvent {
    constructor(client) {
        this.client = client;
    };

    async run(member, executor, reason, duration) {
        const client = this.client;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        await member.roles.add(roles.get("muted").value());
        const Ban = await ChatMuted.findOne({ _id: member.user.id });
        if (!Ban) {
            let pban = new ChatMuted({
                _id: member.user.id,
                executor: executor,
                reason: reason,
                duration: Number(duration) || 0,
                created: new Date()
            });
            await pban.save();
        }
        client.extention.emit('Record', member.user.id, executor, reason, "C-Mute", "temp", duration);

    }
}
module.exports = PermaBanEvent;
