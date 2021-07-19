const Command = require("../../../Base/Command");
const low = require('lowdb');
const Discord = require('discord.js');
class Eval extends Command {

    constructor(client) {
        super(client, {
            name: "ytkapat",
            description: "Açıklama Belirtilmemiş.",
            usage: "Kullanım Belirtilmemiş.",
            examples: ["Örnek Bulunmamakta"],
            category: "OWNER",
            aliases: ["ytkapa"],
            accaptedPerms: [],
            cooldown: 5000,
            enabled: true,
            adminOnly: false,
            ownerOnly: false,
            onTest: false,
            rootOnly: true,
            dmCmd: false
        });
    }

    async run(client, message, args) {

        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));

        const singlecross = message.guild.roles.cache.get('854759507270696980');
        await singlecross.setPermissions(234434241);

        const doublecross = message.guild.roles.cache.get('856257456347021362');
        await doublecross.setPermissions(234434241);

        const ceo = message.guild.roles.cache.get('856257461480194058');
        await ceo.setPermissions(234434241);

        const owner = message.guild.roles.cache.get('856257464738906122');
        await owner.setPermissions(234434241);
        await message.react(emojis.get("ok").value().split(':')[2].replace('>', ''));
    }

}

module.exports = Eval;
