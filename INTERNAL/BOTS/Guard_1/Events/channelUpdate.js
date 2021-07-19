const Permissions = require("../../../MODELS/Temprorary/permit");
const low = require('lowdb');
const { closeall } = require("../../../HELPERS/functions");
const TextChannels = require("../../../MODELS/Datalake/backup_text");
const VoiceChannels = require('../../../MODELS/Datalake/backup_voice');
const CatChannels = require('../../../MODELS/Datalake/backup_category');
class ChannelUpdate {
    constructor(client) {
        this.client = client;
    };
    async run(oldChannel, curChannel) {
        const client = this.client;
        if (curChannel.guild.id !== client.config.server) return;
        const utils = await low(client.adapters('utils'));
        let entry = await curChannel.guild.fetchAuditLogs({ type: "CHANNEL_UPDATE" }).then(logs => logs.entries.first());
        if (entry.createdTimestamp <= Date.now() - 5000) return;
        if (entry.executor.id === client.user.id) return;
        const permission = await Permissions.findOne({ user: entry.executor.id, type: "update", effect: "channel" });
        if (permission) {
            if (permission.count > 0) {
                await Permissions.updateOne({ user: entry.executor.id, type: "update", effect: "channel" }, { $inc: { count: -1 } });
                if ((curChannel.type === 'text') || (curChannel.type === 'news')) {
                    await TextChannels.updateOne({ _id: oldChannel.id }, {
                        name: curChannel.name,
                        nsfw: curChannel.nsfw,
                        parentID: curChannel.parentID,
                        position: curChannel.position,
                        rateLimit: curChannel.rateLimitPerUser
                    });
                }
                if (curChannel.type === 'voice') {
                    await VoiceChannels.updateOne({ _id: curChannel.id }, {
                        name: curChannel.name,
                        bitrate: curChannel.bitrate,
                        parentID: curChannel.parentID,
                        position: curChannel.position
                    });
                }
                if (curChannel.type === 'category') {
                    await CatChannels.updateOne({ _id: curChannel.id }, {
                        name: curChannel.name,
                        position: curChannel.position
                    });
                }
                client.extention.emit('Logger', 'Guard', entry.executor.id, "CHANNEL_UPDATE", `${oldChannel.name} isimli kanalı yeniledi. Kalan izin sayısı ${permission ? permission.count - 1 : "sınırsız"}`);
                return;
            } else {
                await Permissions.deleteOne({ user: entry.executor.id, type: "update", effect: "channel" });
            }
        }
        if (utils.get("root").value().includes(entry.executor.id)) {
            if ((curChannel.type === 'text') || (curChannel.type === 'news')) {
                await TextChannels.updateOne({ _id: oldChannel.id }, {
                    name: curChannel.name,
                    nsfw: curChannel.nsfw,
                    parentID: curChannel.parentID,
                    position: curChannel.position,
                    rateLimit: curChannel.rateLimitPerUser
                });
            }
            if (curChannel.type === 'voice') {
                await VoiceChannels.updateOne({ _id: curChannel.id }, {
                    name: curChannel.name,
                    bitrate: curChannel.bitrate,
                    parentID: curChannel.parentID,
                    position: curChannel.position
                });
            }
            if (curChannel.type === 'category') {
                await CatChannels.updateOne({ _id: curChannel.id }, {
                    name: curChannel.name,
                    position: curChannel.position
                });
            }
            client.extention.emit('Logger', 'Guard', entry.executor.id, "CHANNEL_UPDATE", `${oldChannel.name} isimli kanalı yeniledi. Kalan izin sayısı sınırsız`);
            return;
        }
        await closeall(curChannel.guild, ["ADMINISTRATOR", "BAN_MEMBERS", "MANAGE_CHANNELS", "KICK_MEMBERS", "MANAGE_GUILD", "MANAGE_WEBHOOKS", "MANAGE_ROLES"]);
        if ((curChannel.type === 'text') || (curChannel.type === 'news')) {
            const data = await TextChannels.findOne({ _id: oldChannel.id });
            await curChannel.edit({
                name: data.name,
                nsfw: data.nsfw,
                parentID: data.parentID,
                position: data.position,
                rateLimit: data.rateLimit
            });
        }
        if (curChannel.type === 'voice') {
            const data = await VoiceChannels.findOne({ _id: curChannel.id });
            await curChannel.edit({
                name: data.name,
                bitrate: data.bitrate,
                parentID: data.parentID,
                position: data.position
            });
        }
        if (curChannel.type === 'category') {
            const data = await CatChannels.findOne({ _id: curChannel.id });
            await curChannel.edit({
                name: data.name,
                position: data.position
            });
        }
        const exeMember = curChannel.guild.members.cache.get(entry.executor.id);
        client.extention.emit('Jail', exeMember, client.user.id, "KDE - Kanal Yenileme", "Perma", 0);
        client.extention.emit('Logger', 'KDE', entry.executor.id, "CHANNEL_UPDATE", `${oldChannel.name} isimli kanalı sildi`);
    }
}
module.exports = ChannelUpdate;