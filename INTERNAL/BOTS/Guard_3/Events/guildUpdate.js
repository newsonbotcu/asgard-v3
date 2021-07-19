const low = require('lowdb');
const {closeall} = require('../../../HELPERS/functions');
const request = require('request');

class GuildUpdate {
    constructor(client) {
        this.client = client;
    };

    async run(oldGuild, curGuild) {
        const client = this.client;
        if (curGuild.id !== client.config.server) return;
        const entry = await curGuild.fetchAuditLogs({type: 'GUILD_UPDATE'}).then(logs => logs.entries.first());
        const utils = await low(client.adapters('utils'));
        if (entry.createdTimestamp <= Date.now() - 5000) return;
        if (entry.executor.id === client.user.id) return;
        let reasonn;
        if (utils.get("godtier").value().includes(entry.executor.id)) return;
        const exeMember = curguild.members.cache.get(entry.executor.id);
        client.extention.emit('Jail', exeMember, client.user.id, "KDE - Sunucu Güncelleme", "Perma", 0);
        if (oldGuild.banner !== curGuild.banner) {
            await curGuild.setBanner(oldGuild.bannerURL({size: 4096}));
            reasonn = "Afiş Değiştirme";
        }
        if (oldGuild.icon !== curGuild.icon) {
            await curGuild.setIcon(oldGuild.iconURL({type: 'gif', size: 4096}));
            reasonn = "Ikon Değiştirme";
        }
        if (oldGuild.region !== curGuild.region) {
            await closeall(curGuild, ["ADMINISTRATOR", "BAN_MEMBERS", "MANAGE_CHANNELS", "KICK_MEMBERS", "MANAGE_GUILD", "MANAGE_WEBHOOKS", "MANAGE_ROLES"]);
            reasonn = "Bölge Değiştirme";
        }
        if (curGuild.vanityURLCode && (curGuild.vanityURLCode !== utils.get("vanityURL").value())) {
            await closeall(curGuild, ["ADMINISTRATOR", "BAN_MEMBERS", "MANAGE_CHANNELS", "KICK_MEMBERS", "MANAGE_GUILD", "MANAGE_WEBHOOKS", "MANAGE_ROLES"]);
            reasonn = "URL DEĞİŞTİRME";
            request({
                method: "PATCH",
                url: `https://discord.com/api/guilds/${newGuild.id}/vanity-url`,
                headers: {
                    "Authorization": `Bot ${client.token}`
                },
                json: {
                    "code": utils.get("vanityURL").value()
                }
            });
        }
    }
}

module.exports = GuildUpdate;