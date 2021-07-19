const Discord = require('discord.js');
const Command = require("../../../Base/Command");
const low = require('lowdb');
class Perm extends Command {
    constructor(client) {
        super(client, {
            name: "rolver",
            description: "Sunucuda bulunan yetkililere perm vermek için kullanılır",
            usage: "rolver etiket/id -roladı",
            examples: ["rolver @Cofteey#0046 -ability"],
            cooldown: 3600000,
            category: "Perm",
            aliases: ["rolver"],
            accaptedPerms: ["cmd-ceo"],
            enabled: false
        });
    }
    async run(client, message, args, data) {
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        let user = message.mentions.members.firts() || message.guild.members.cache.get(args[0]);
        if (!user.roles.cache.has(roles.get("cmd-ceo").value()) && !member.hasPermission("ADMINISTRATOR"))
        return message.channel.send("Bunu yapmak için yeterli yetkiye sahip değilsin!")
        if (args.length < 1) return message.channel.send("Bir kullanıcı girmeyi unuttun!")
        if (!user) return message.channel.send("Belirttiğin kullanıcı geçerli değil!")
        let map = new Map([
            ["-jail", ["857386603373395999"]],
            ["-registry", ["857386814791483412"]],
            ["-mute", ["857386624383975474"]],
            ["-ability", ["857386627219193856"]]
        ])
        let metin = ""
        let arr = []
        for (let [k, v]of map) {
            if (args[0] == k) return
            v.map(x => {
                arr.push(x)
            })
        }
        for (let [k, v]of map){
            metin = metin + `${emojis.get("ok").value()} \`${k}\` - ${v.filter(x => x !== "857386603373395999","857386627219193856").map(x => `<@&${x}>`)}\n`
        }
        let values = args[1]
        embed.setDescription(`${emojis.get("ok").value()} Belirttiğin rol geçerli değil. Lütfen aşağıda belirtmiş olduğumuz kullanım kılavuzuna bakarak doğru komutu kullanabilirsin.\n\n───────────────────────────────────────────\n\n${emojis.get("ok").value()} \`-jail\` - <@&857386603373395999>\n${emojis.get("ok").value()} \`-registry\` - <@&857386814791483412>\n${emojis.get("ok").value()} \`-mute\` - <@&857386624383975474>\n${emojis.get("ok").value()} \`-ability\` - <@&857386627219193856>\n───────────────────────────────────────────\n\n${emojis.get("ok").value()} Komutun Kullanım Örneği: \`.yetkiver @Cofteey#0046 -ability\``)
        if (!values) return message.channel.send(embed)
        const roller = map.get(values)
        await user.roles.add(roller)
        let arrx = arr.filter(function (item, pos) {
            return arr.indexOf(item) == pos;
        })
        arrx.map(async (x) =>{
            if (user.roles.cache.has(x)) {
                if (roller.includes(x)) return
                await user.roles.remove(x)
            }
        })
        embed.setDescription(`${user} kullanıcısına <@${roller[0]}> yetkisi verildi`)
        message.channel.send(embed)
    }
}

module.exports = Perm;