const low = require('lowdb');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const Discord = require('discord.js');
module.exports = class {

    constructor(client) {
        this.client = client;
    }

    async run(client) {

        client = this.client;
        const utils = await low(client.adapters('utils'));
        client.guild = client.guilds.cache.get(client.config.server);
        client.logger.log(`${client.user.tag}, ${client.users.cache.size} kişi için hizmet vermeye hazır!`, "ready");
        await client.user.setPresence({ activity: client.config.status, status: "idle" });
        client.owner = client.users.cache.get(client.config.owner);
        client.channels.cache.get(utils.get("lastCrush").value()).send("**TEKRAR ONLINE!**");
        client.canvas = new ChartJSNodeCanvas({
            width: 600, height: 600, chartCallback: (ChartJS) => {
                ChartJS.defaults.global.defaultFontFamily = 'Arial';
            }
        });
        /*
        const tokens = [
            config.SES1,
            config.SES2,
            config.SES3
        ];
        client.musicbots = [];
        for (let index = 0; index < tokens.length; index++) {
            const cclient = new Discord.Client();
            cclient.login(tokens[index]);
            cclient.queue = new Map();
            client.musicbots.push(cclient)
        }
        */
    }
}
