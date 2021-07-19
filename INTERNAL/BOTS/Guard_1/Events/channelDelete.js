const Permissions = require("../../../MODELS/Temprorary/permit");
const low = require('lowdb');
const { closeall } = require("../../../HELPERS/functions");
const TextChannels = require("../../../MODELS/Datalake/backup_text");
const VoiceChannels = require('../../../MODELS/Datalake/backup_voice');
const CatChannels = require('../../../MODELS/Datalake/backup_category');
const overwrites = require("../../../MODELS/Datalake/backup_overwrite");
class ChannelDelete {
    constructor(client) {
        this.client = client;
    };
    async run(channel) {
        const client = this.client;
        if (channel.guild.id !== client.config.server) return;
        const utils = await low(client.adapters('utils'));
        const entry = await channel.guild.fetchAuditLogs({ type: "CHANNEL_DELETE" }).then(logs => logs.entries.first());
        if (entry.createdTimestamp <= Date.now() - 5000) return;
        if (entry.executor.id === client.user.id) return;
        const permission = await Permissions.findOne({ user: entry.executor.id, type: "delete", effect: "channel" });
        if ((permission && (permission.count > 0)) || utils.get("root").value().includes(entry.executor.id)) {
            if (permission) await Permissions.updateOne({ user: entry.executor.id, type: "delete", effect: "channel" }, { $inc: { count: -1 } });
            if ((channel.type === 'text') || (channel.type === 'news')) await TextChannels.deleteOne({ _id: channel.id });
            if (channel.type === 'voice') await VoiceChannels.deleteOne({ _id: channel.id });
            if (channel.type === 'category') await CatChannels.deleteOne({ _id: channel.id });
            await overwrites.deleteOne({ _id: channel.id });
            client.extention.emit('Logger', 'Guard', entry.executor.id, "CHANNEL_DELETE", `${entry.executor.username} ${channel.name} isimli kanalı sildi. Kalan izin sayısı ${permission ? permission.count - 1 : "sınırsız"}`);
            return;
        }
        if (permission) await Permissions.deleteOne({ user: entry.executor.id, type: "delete", effect: "channel" });
        await closeall(channel.guild, ["ADMINISTRATOR", "BAN_MEMBERS", "MANAGE_CHANNELS", "KICK_MEMBERS", "MANAGE_GUILD", "MANAGE_WEBHOOKS", "MANAGE_ROLES"]);
        let newChannel;
        if ((channel.type === 'text') || (channel.type === 'news')) {
            await TextChannels.deleteOne({ _id: channel.id });
            newChannel = await channel.guild.channels.create(channel.name, {
                type: channel.type,
                topic: channel.topic,
                nsfw: channel.nsfw,
                parent: channel.parent,
                position: channel.position + 1,
                rateLimitPerUser: channel.rateLimitPerUser
            });
            const begon = new TextChannels({
                _id: newChannel.id,
                name: newChannel.name,
                nsfw: newChannel.nsfw,
                parentID: newChannel.parentID,
                position: newChannel.position,
                rateLimit: newChannel.rateLimitPerUser
            });
            await begon.save();
        }
        if (channel.type === 'voice') {
            await VoiceChannels.deleteOne({ _id: channel.id });
            newChannel = await channel.guild.channels.create(channel.name, {
                type: channel.type,
                bitrate: channel.bitrate,
                userLimit: channel.userLimit,
                parent: channel.parent,
                position: channel.position + 1
            });
            const begon = new VoiceChannels({
                _id: newChannel.id,
                name: newChannel.name,
                bitrate: newChannel.bitrate,
                parentID: newChannel.parentID,
                position: newChannel.position
            });
            await begon.save();
        }
        if (channel.type === 'category') {
            await CatChannels.deleteOne({ _id: channel.id });
            newChannel = await channel.guild.channels.create(channel.name, {
                type: channel.type,
                position: channel.position + 1
            });
            const textChannels = await TextChannels.find({ parentID: channel.id });
            await TextChannels.updateMany({ parentID: channel.id }, { parentID: newChannel.id });
            textChannels.forEach(c => {
                const textChannel = channel.guild.channels.cache.get(c._id);
                if (textChannel) textChannel.setParent(newChannel, { lockPermissions: false });
            });
            const voiceChannels = await VoiceChannels.find({ parentID: channel.id });
            await VoiceChannels.updateMany({ parentID: channel.id }, { parentID: newChannel.id });
            voiceChannels.forEach(c => {
                const voiceChannel = channel.guild.channels.cache.get(c._id);
                if (voiceChannel) voiceChannel.setParent(newChannel, { lockPermissions: false });
            });
            const begon = new CatChannels({
                _id: newChannel.id,
                name: newChannel.name,
                position: newChannel.position
            });
            await begon.save();
        }
        const overwritesData = await overwrites.findOne({ _id: channel.id });
        await newChannel.overwritePermissions(overwritesData.overwrites);
        await overwrites.deleteOne({ _id: channel.id });
        const newData = new overwrites({ _id: newChannel.id, overwrites: overwritesData.overwrites });
        await newData.save();
        const exeMember = channel.guild.members.cache.get(entry.executor.id);
        client.extention.emit('Jail', exeMember, client.user.id, "KDE - Kanal Silme", "Perma", 0);
        client.extention.emit('Logger', 'KDE', entry.executor.id, "CHANNEL_DELETE", `${channel.name} isimli kanalı sildi`);
    }
}
module.exports = ChannelDelete;