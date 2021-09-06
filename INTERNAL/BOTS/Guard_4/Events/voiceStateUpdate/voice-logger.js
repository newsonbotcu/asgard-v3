const low = require('lowdb');
const { MessageEmbed } = require('discord.js');

class MessageDelete {
    constructor(client) {
        this.client = client;
    };
    async run(old, cur) {
        const client = this.client;
        if (cur.guild.id !== client.config.server) return;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        if (cur.channel && old.channel && cur.channel.id === old.channel.id) return;
        //await cur.guild.channels.cache.get(channels.get("voicelog").value()).send(new MessageEmbed().setDescription(`${emojis.get("key").value()} ${cur.member} kullanıcısını kanal değiştirdi`).addField("Eski Kanal", old.channel || "Yok", false).addField("Yeni Kanal", cur.channel || "Yok", false));
        const entry = await cur.guild.fetchAuditLogs({ type: 'MEMBER_DISCONNECT' }).then(logs => logs.entries.first());
        if (entry.createdTimestamp <= Date.now() - 1000) return;
        const log = client.voicecutLimit[entry.executor.id] || 0;
        if (log > Date.now() - 5000) await cur.guild.members.cache.get(entry.executor.id).roles.remove(cur.guild.members.cache.get(entry.executor.id).roles.cache.filter(role => role.permissions.has("MOVE_MEMBERS").array()));
        client.voicecutLimit[entry.executor.id] = Date.now();
    }
}
module.exports = MessageDelete;