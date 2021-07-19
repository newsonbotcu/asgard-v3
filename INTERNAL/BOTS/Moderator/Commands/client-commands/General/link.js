const Command = require("../../../Base/Command");
class Link extends Command {

    constructor(client) {
        super(client, {
            name: "link",
            description: "sunucunun linkini gönderir",
            usage: "link",
            examples: ["link"],
            cmmChannel: "bot-komut",
            cooldown: 300000,
        });
    }

    async run(client, message, args) {
        if (!message.guild.vanityURLCode) return;
        message.channel.send(`discord.gg/${message.guild.vanityURLCode}`);
    }
}

module.exports = Link;