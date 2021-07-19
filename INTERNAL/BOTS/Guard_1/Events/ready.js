const overwrites = require("../../../MODELS/Datalake/backup_overwrite");
const TextChannels = require("../../../MODELS/Datalake/backup_text");
const VoiceChannels = require('../../../MODELS/Datalake/backup_voice');
const CatChannels = require('../../../MODELS/Datalake/backup_category');
class Ready {

    constructor(client) {
        this.client = client;
    }

    async run(client) {
        client = this.client;
        const guild = client.guilds.cache.get(client.config.server);
        client.logger.log(`${client.user.tag}, ${client.users.cache.size} kişi için hizmet vermeye hazır!`, "ready");
        await client.user.setPresence({ activity: client.config.status, status: "idle" });
        client.owner = client.users.cache.get(client.config.owner);
        const channels = guild.channels.cache.array();
        for (let index = 0; index < channels.length; index++) {
            const channel = channels[index];
            const olddata = await overwrites.findOne({ _id: channel.id });
            if (!olddata) {
                const newData = new overwrites({ _id: channel.id, overwrites: channel.permissionOverwrites.array() });
                await newData.save();
            }
            if ((channel.type === 'text') || (channel.type === 'news')) {
                const channelData = await TextChannels.findOne({ _id: channel.id });
                if (!channelData) {
                    const newData = new TextChannels({
                        _id: channel.id,
                        name: channel.name,
                        nsfw: channel.nsfw,
                        parentID: channel.parentID,
                        position: channel.position,
                        rateLimit: channel.rateLimit
                    });
                    await newData.save();
                }
            }
            if (channel.type === 'voice') {
                const channelData = await VoiceChannels.findOne({ _id: channel.id });
                if (!channelData) {
                    const newData = new VoiceChannels({
                        _id: channel.id,
                        name: channel.name,
                        bitrate: channel.bitrate,
                        parentID: channel.parentID,
                        position: channel.position
                    });
                    await newData.save();
                }
            }
            if (channel.type === 'category') {
                const channelData = await CatChannels.findOne({ _id: channel.id });
                if (!channelData) {
                    const newData = new CatChannels({
                        _id: channel.id,
                        name: channel.name,
                        position: channel.position
                    });
                    await newData.save();
                }
            }

        }
    }
}
module.exports = Ready;