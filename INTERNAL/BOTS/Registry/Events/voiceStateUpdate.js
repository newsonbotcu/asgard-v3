const low = require('lowdb');
const private_channels = require('../../../MODELS/Temprorary/private_channels');

class VoiceStateUpdate {
    constructor(client) {
        this.client = client;
    }
    async run(prev, cur) {
        const client = this.client;
        const leaves = client.leaves;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        if (prev && prev.channel && cur && cur.channel && (cur.channel.id === prev.channel.id)) return;
        const privChannels = await private_channels.find();
        const channel = client.guild.channels.cache.get(channels.get("oda_olustur").value());
        if (prev.channel && privChannels.some(c => c._id === prev.channel.id) && (prev.channel.id !== channel.id)) {
            if (prev.channel && (prev.channel.members.size === 0)) {
                await prev.channel.delete();
                await private_channels.deleteOne({ _id: prev.channel.id });
                return;
            }
            const myChannelData = privChannels.find(c => c.owner === prev.member.user.id);
            if (myChannelData) {
                const myChannel = prev.guild.channels.cache.get(myChannelData._id);
                if (prev.channel && (prev.member.user.id === myChannelData.owner) && (prev.channel.id === myChannelData._id)) {
                    const myTimeout = setTimeout(async () => {
                        await myChannel.setUserLimit(myChannel.members.size);
                        leaves.delete(myChannel.id);
                    }, 600000);
                    leaves.set(myChannel.id, myTimeout);
                }
            }
        }
        if (cur && cur.channel) {
            const myChannelData = privChannels.find(c => c.owner === prev.member.user.id);
            if (myChannelData) {
                const myChannel = prev.guild.channels.cache.get(myChannelData._id);
                if (cur.channel && (cur.member.user.id === myChannelData.owner) && (cur.channel.id === myChannelData._id)) {
                    clearTimeout(leaves.get(myChannel.id));
                    leaves.delete(myChannel.id);
                }
            }
            if (cur.channel.id === channel.id) {
                const oldData = await private_channels.findOne({ owner: cur.member.user.id });
                if (oldData) return await cur.member.voice.setChannel(oldData._id);
                const nueva = await channel.clone({
                    name: cur.member.displayName,
                    userLimit: 1,
                    permissionOverwrites: [
                        {
                            id: client.guild.roles.everyone.id,
                            allow: [],
                            deny: ["MOVE_MEMBERS"]
                        },
                        {
                            id: cur.member.user.id,
                            allow: ["MOVE_MEMBERS"],
                            deny: []
                        },
                        {
                            id: roles.get("musicbots").value(),
                            allow: ["CONNECT", "MOVE_MEMBERS"],
                            deny: []
                        }
                    ]
                });
                await private_channels.create({ _id: nueva.id, owner: cur.member.user.id });
                await cur.member.voice.setChannel(nueva.id);
            }
        }
    }
}
module.exports = VoiceStateUpdate;