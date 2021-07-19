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
    "857657860452122674",
    "857657892474978374",
    "857657917444718633",
    "857657943875911740",
    "857657999577055244"
];
const myTokens = [
    process.env.token_1,
    process.env.token_2,
    process.env.token_3,
    process.env.token_4,
    process.env.token_5,
    process.env.token_6,
    process.env.token_7
];
for (let tokenim = 0; tokenim < myTokens.length; tokenim++) {
    const tokeni = myTokens[tokenim];
    const client = new Discord.Client();
    client.login(tokeni);
    client.on("ready", async () => {
        await client.channels.cache.get("860909021406036031").join();
        await client.user.setPresence({activity: {
            name: "Tantoony 🤍 INFEЯИO",
            type: "LISTENING"
        }});
    });
    client.on('voiceStateUpdate', async (prev, cur) => {
        if (cur.member.id === client.user.id) concon = await client.channels.cache.get("860909021406036031").join();
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
                name: "Voice of INFEЯИO"
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
            if (selamlı.includes(cur.member.id) && (cur.member.roles.highest.rawPosition <= cur.guild.roles.cache.get("857386814791483412").rawPosition)) {
                //console.log(selamlı);
                ses = await concon.play('./ses_tekrardan.mp3', options);
                return;
            }
            if ((cur.member.roles.highest.rawPosition <= cur.guild.roles.cache.get("857386814791483412").rawPosition)) {
                ses = await concon.play('./ses_merhaba.mp3', options);
                selamlı.push(cur.member.user.id);
            } else if ((cur.member.roles.highest.rawPosition >= cur.guild.roles.cache.get('857386814791483412').rawPosition) && cur.channel.members.filter(m => m.roles.highest.rawPosition >= prev.guild.roles.cache.get('857386814791483412').rawPosition).size < 2) {
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