class Command {
    constructor(client, {
        name = null,
        channel = null,
        accaptedPerms = [],
        cooldown = 5000,    
        enabled = true,
        ownerOnly = false,
        rootOnly = false,
        onTest = false,
        adminOnly = false
    }) {
        this.client = client;
        this.config = {
            enabled,
            ownerOnly,
            rootOnly,
            onTest,
            adminOnly
        };
        this.info = {
            name,
            channel,
            accaptedPerms,
            cooldown
        };
    }
}
module.exports = Command;