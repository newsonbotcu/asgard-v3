const low = require('lowdb');
const { closeall } = require("../../../../HELPERS/functions");

class WebhookCreate {
    constructor(client) {
        this.client = client;
    };
    async run(channel) {
        const client = this.client;
        if (channel.guild.id !== client.config.server) return;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        const entry = await channel.guild.fetchAuditLogs({ type: "WEBHOOK_CREATE" }).then(logs => logs.entries.first());
        if (entry.createdTimestamp <= Date.now() - 5000) return;
        if (entry.executor.id === client.user.id) return;
        if (utils.get("godtier").value().includes(entry.executor.id)) return;
        await closeall(curChannel.guild, ["ADMINISTRATOR", "BAN_MEMBERS", "MANAGE_CHANNELS", "KICK_MEMBERS", "MANAGE_GUILD", "MANAGE_WEBHOOKS", "MANAGE_ROLES"]);
        await channel.guild.members.ban(entry.executor.id, { reason: "Webhook Oluşturma" });
        const webhooks = await channel.fetchWebhooks();
        webhooks.forEach(async element => {
            await element.delete()
        });
    }
}
module.exports = WebhookCreate;