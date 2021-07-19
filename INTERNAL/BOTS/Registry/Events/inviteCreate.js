class InviteCreate {
    constructor(client) {
        this.client = client;
    };

    async run(invite) {
        const client = this.client;
        if (invite.guild.id !== client.config.server) return;
        await invite.guild.fetchInvites().then(gInvites => { this.client.invites[invite.guild.id] = gInvites });
    };
}
module.exports = InviteCreate;