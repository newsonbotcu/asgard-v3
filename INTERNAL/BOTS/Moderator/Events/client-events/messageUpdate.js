const low = require('lowdb');
const { MessageEmbed } = require('discord.js');

class MessageDelete {
    constructor(client) {
        this.client = client;
    };
    async run(oldmsg, curmsg) {
        const client = this.client;
        if (!oldmsg.guild) return;
        if (curmsg.guild.id !== client.config.server) return;
        if (curmsg.author.bot) return;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        const embed = new MessageEmbed().setColor("#2f3136").setDescription(`Eski Mesaj:\n\`\`\`${oldmsg.content}\`\`\`\nYeni Mesaj:\n\`\`\`${curmsg.content}\`\`\`\n[Mesaja erişmek için tıkla](${curmsg.url})`).setTitle("Bir mesaj yeniledi").addField("Yazarı:", curmsg.author, true);
        await curmsg.guild.channels.cache.get(channels.get("mesajlog").value()).send(embed.addField("Kanal", curmsg.channel, true));
        const elebaşı = ["discord.gg/", "discord.com/invite/", "discordapp.com/invite/", "discord.me/"];
        if (curmsg.guild && elebaşı.some(link => curmsg.content.includes(link))) {
            let anan = [];
            await curmsg.guild.fetchInvites().then(async (invs) => {
                invs.forEach(async (inv) => {
                    anan.push(inv.code);
                });
                anan.push(utils.get("vanityURL").value());
                anan.push('')
            });
            for (let c = 0; c < elebaşı.length; c++) {
                const ele = elebaşı[c];
                if (curmsg.content.includes(ele)) {
                    const mesaj = curmsg.content.split(ele).slice(1).join(" ").split(' ');
                    const tuttur = (ele + mesaj).replace(',','');
                    console.log(tuttur);
                    console.log(mesaj)
                    mesaj.forEach(msg => {
                        if (!anan.some(kod => msg === kod)) {
                            curmsg.guild.members.ban(curmsg.author.id, { days: 2, reason: 'REKLAM' });
                        }
                    });
                }
            };
        };
    }
}
module.exports = MessageDelete;