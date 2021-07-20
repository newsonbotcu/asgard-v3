const Component = require("../../../Base/Component");
const Discord = require('discord.js');
const low = require('lowdb');
const { stripIndent } = require("common-tags");
const Task_roles = require("../../../../../MODELS/Economy/Task_roles");
const Task_profile = require("../../../../../MODELS/Economy/Task_profile");
class RolSeçim extends Component {
    constructor(client) {
        super(client, {
            name: "task_info",
            accaptedPerms: [],
            cooldown: 10000,
            enabled: true,
            ownerOnly: false,
            rootOnly: false,
            onTest: false,
            adminOnly: false
        });
    }

    async run(ctx) {
        const client = this.client;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const channels = await low(client.adapters('channels'));
        const emojis = await low(client.adapters('emojis'));
        const guild = client.guilds.cache.get(ctx.guildID);
        const mentioned = guild.members.cache.get(ctx.user.id);
        const profile = await Task_profile.findOne({ _id: mentioned.user.id });
        const myRol = guild.roles.cache.get(profile.role);
        const RoleData = await Task_roles.findOne({ _id: myRol.id });
        const Duties = await RoleData.tasks;
        const noDutyEmbed = new Discord.MessageEmbed().setDescription(`${myRol} rolü için oluşturulmuş bir görev bulunmamakta.`);
        if (!RoleData || (Duties.length === 0)) return await ctx.send({
            embeds: [noDutyEmbed],
            ephemeral: true
        });
        const embed = new Discord.MessageEmbed().setDescription(`${myRol} rolü için görevler aşağıda belirtilmiştir`).setTitle("ASGARD KILL ZONE")
            .addField(`${emojis.get("task_registry").value()} Kayıt Görevi`, Duties.some(duty => duty.type === "registry") ? stripIndent`
        Kayıt: ${Duties.find(duty => duty.type === "registry").count}
        Puan: ${Duties.find(duty => duty.type === "registry").points}
        \n‏‏‎ ‎
        `: "Yok", true)
            .addField(`${emojis.get("task_invite").value()} Davet Görevi`, Duties.some(duty => duty.type === "invite") ? stripIndent`
        Davet: ${Duties.find(duty => duty.type === "invite").count}
        Puan: ${Duties.find(duty => duty.type === "invite").points}
        \n‏‏‎ ‎
        `: "Yok", true)
            .addField(`${emojis.get("task_voicexp").value()} Ses Aktifliği`, Duties.some(duty => duty.type === "voicexp") ? stripIndent`
        Xp: ${Duties.find(duty => duty.type === "voicexp").count}
        Puan: ${Duties.find(duty => duty.type === "voicexp").points}
        \n‏‏‎ ‎
        `: "Yok", true)
            .addField(`${emojis.get("task_messagexp").value()} Chat Aktifliği`, Duties.some(duty => duty.type === "message") ? stripIndent`
        Mesaj: ${Duties.find(duty => duty.type === "messagexp").count}
        Puan: ${Duties.find(duty => duty.type === "messagexp").points}
        \n‏‏‎ ‎
        `: "Yok", true)
            .addField(`${emojis.get("task_tagged").value()} Taglı Çekme`, Duties.some(duty => duty.type === "tagged") ? stripIndent`
        Taglı: ${Duties.find(duty => duty.type === "tagged").count}
        Puan: ${Duties.find(duty => duty.type === "tagged").points}
        \n‏‏‎ ‎
        `: "Yok", true)
            .addField(`${emojis.get("task_auth").value()} Yetkili Çekme`, Duties.some(duty => duty.type === "auth") ? stripIndent`
        Yetkili: ${Duties.find(duty => duty.type === "auth").count}
        Puan: ${Duties.find(duty => duty.type === "auth").points}
        \n‏‏‎ ‎
        `: "Yok", true)
        await ctx.send({
            embeds: [embed],
            ephemeral: true
        });

    }
}

module.exports = RolSeçim;