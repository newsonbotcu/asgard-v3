const Discord = require('discord.js');
require('dotenv').config({ path: __dirname + '/../../../.env' });
const tokens = [
    process.env.ses1,
    process.env.ses2,
    process.env.ses3,
    process.env.ses4,
    process.env.ses5
];
const chnls = [
    "864473576283439111",
    "864473576283439112",
    "864473576283439113",
    "864473576639037440",
    "864473576639037441"
];
const myTokens = [
    process.env.token_architect,
    process.env.token_builder,
    process.env.token_chief,
    process.env.token_database,
    process.env.token_executor,
    process.env.token_force
];
for (let tokenim = 0; tokenim < myTokens.length; tokenim++) {
    const tokeni = myTokens[tokenim];
    const client = new Discord.Client();
    client.login(tokeni);
    client.on("ready", async () => {
        await client.channels.cache.get("864514930471206932").join();
        await client.user.setPresence({activity: {
            name: "💯 Asgard Kill Zone",
            type: "LISTENING"
        }});
    });
    client.on('voiceStateUpdate', async (prev, cur) => {
        if (cur.member.id === client.user.id) concon = await client.channels.cache.get("864514930471206932").join();
    });
}
const selamlı = [];
for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    const client = new Discord.Client();
    client.login(token);
    let concon;
    client.on('ready', async () => {
        console.log(client.user.username);
        concon = await client.channels.cache.get(chnls[index]).join();
        await client.user.setPresence({
            status: "online",
            activity: {
                type: "LISTENING",
                name: "Voice of Asgard"
            }
        });
    });
    let ses;
    const options = {
        quality: 'highestaudio',
        volume: 0.6,
        bitrate: 'auto'
    }
    client.on('voiceStateUpdate', async (prev, cur) => {
        if (cur.member.user.bot) return;
        if (cur.channel && (cur.channel.id === chnls[index])) {
            if (cur.channelID === prev.channelID) return;
            if (selamlı.includes(cur.member.id) && (cur.member.roles.highest.rawPosition <= cur.guild.roles.cache.get("864473575904772131").rawPosition)) {
                //console.log(selamlı);
                ses = await concon.play('./ses_tekrardan.mp3', options);
                return;
            }
            if ((cur.member.roles.highest.rawPosition <= cur.guild.roles.cache.get("864473575904772131").rawPosition)) {
                ses = await concon.play('./ses_merhaba.mp3', options);
                selamlı.push(cur.member.user.id);
            } else if ((cur.member.roles.highest.rawPosition >= cur.guild.roles.cache.get('864473575904772131').rawPosition) && cur.channel.members.filter(m => m.roles.highest.rawPosition >= prev.guild.roles.cache.get('864473575904772131').rawPosition).size < 2) {
                ses = await concon.play('./ses_yetkili.mp3', options);
                selamlı.push(cur.member.user.id);
            }
        }
        if (prev.channel && (prev.channel.id === chnls[index]) && (prev.channel.members.size === 1) && ses) ses.end();
    });
    client.on('guildMemberUpdate', async (prev, cur) => {
        if (concon.channel.members.some(biri => biri.user.id === cur.user.id)) {
            if ((prev.roles.highest.rawPosition < cur.roles.highest.rawPosition)) {
                ses = await concon.play('./ses_tamamlandi.mp3', options);
            }
        } else return;
    });
    client.on('voiceStateUpdate', async (prev, cur) => {
        if (cur.member.id === client.user.id) concon = await client.channels.cache.get(chnls[index]).join();
    });
}