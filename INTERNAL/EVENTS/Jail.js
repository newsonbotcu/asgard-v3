const Jails = require('../MODELS/Moderation/mod_jail');
const low = require('lowdb');

class JailEvent {
    constructor(client) {
        this.client = client;
    };

    async run(member, executor, reason, type, duration) {
        const client = this.client;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        const memberRoles = member.roles.cache.filter(r => r.id !== roles.get("booster").value()).filter(r => r.editable).array();
        await member.roles.remove(memberRoles);
        await member.roles.add(roles.get("prisoner").value());
        let deletedRoles = await memberRoles.map(r => r.name);
        const Jail = await Jails.findOne({ _id: member.user.id });
        if (!Jail) {
            let pjail = new Jails({
                _id: member.user.id,
                executor: executor,
                reason: reason,
                roles: deletedRoles,
                type: type,
                duration: Number(duration) || 0,
                created: new Date()
            });
            await pjail.save();
        } else {
            await Jails.updateOne({ _id: member.user.id }, { $inc: { duration: Number(duration) || 0 } });
        }
        client.extention.emit('Record', member.user.id, executor, reason, "Jail", type, duration);
    }
}

module.exports = JailEvent;