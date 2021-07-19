const VoiceMuted = require('../MODELS/Moderation/mod_vmute');
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
        const voice = member.voice;
        if (voice && voice.channel) await voice.setMute(true, reason);
        const Ban = await VoiceMuted.findOne({ _id: member.user.id });
        if (!Ban) {
            let pban = new VoiceMuted({
                _id: member.user.id,
                executor: executor,
                reason: reason,
                duration: Number(duration) || 0,
                created: new Date()
            });
            await pban.save();
        }
        client.extention.emit('Record', member.user.id, executor, reason, "V-Mute", "temp", duration);

    }
}
module.exports = PermaBanEvent;
