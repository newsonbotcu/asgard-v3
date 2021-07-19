const Command = require('../../../Base/Command');
const Discord = require('discord.js');
const nameData = require('../../../../../MODELS/Datalake/Registered');
const low = require('lowdb');
class KayitSil extends Command {
    constructor(client) {
        super(client, {
            name: "kayitsil",
            description: "Kayıt olan bir kullanıcıyı kayıtsıza atar ve o kullanıcının kaydını siler",
            usage: "kayitsil etiket/id",
            examples: ["kayitsil 674565119161794560"],
            category: "Kayıt",
            aliases: ["kayıtsil", "kayıtsız", "kayitsiz"],
            //cmdChannel: "suspicious",
            accaptedPerms: ["oluozan", "oluozan2", "cmd-all"],
            cooldown: 10000
        });
    };
    async run(client, message, args) {
        client = this.client;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        const mentioned = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!mentioned) return message.channel.send(new Discord.MessageEmbed().setDescription(`${emojis.get("kullaniciyok").value()} Kullanıcı bulunamadı!`).setColor('#2f3136'));
        const data = await nameData.findOne({ _id: mentioned.user.id });
        if (!data) return message.channel.send(new Discord.MessageEmbed().setDescription('Veri bulunamadı').setColor('RED'));
        if (message.member.roles.highest.rawPosition <= mentioned.roles.highest.rawPosition) return message.channel.send(new Discord.MessageEmbed().setColor('#2f3136').setDescription(`${emojis.get("missingPerms").value()} Bunu yapmak için yeterli yetkiye sahip değilsin`));
        await nameData.deleteOne({ _id: mentioned.user.id });
        await mentioned.roles.remove(mentioned.roles.cache.filter(r => r.editable).array());
        await mentioned.roles.add(roles.get('welcome').value());
        await message.channel.send(new Discord.MessageEmbed().setDescription("Kullanıcının verileri başarıyla silindi").setColor('#2f3136'));
        await message.guild.channels.cache.get(channels.get("mod-registry").value()).send(new Discord.MessageEmbed().setDescription(`${message.member} yetkilisi ${mentioned} kişisinin kayıt verilerini sildi.`));
    }
}
module.exports = KayitSil;