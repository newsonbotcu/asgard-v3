const low = require('lowdb');
const Profile = require('../MODELS/Economy/Profile');
const roleXp = require('../MODELS/Economy/roleXp');

class MemberXpEvent {
    constructor(client) {
        this.client = client;
    };

    async run(member) {
        const client = this.client;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        const profile = await Profile.findOne({ _id: member.user.id });
        const ranks = await roleXp.find();
        const myRank = ranks.find(rank => member.roles.cache.has(rank));
        //console.log(ranks.sort((a, b) => b.requiredXp - a.requiredXp).map(r => member.guild.roles.cache.get(r._id).name));
        const nextRank = ranks.sort((a, b) => b.requiredXp - a.requiredXp).find(rank => rank.requiredXp > (myRank ? myRank.requiredXp : 0));
        if (profile.xp > nextRank.requiredXp) {
            await member.roles.add(nextRank._id);
            await member.roles.remove(myRank._id);
        }

    }
}
module.exports = MemberXpEvent;
