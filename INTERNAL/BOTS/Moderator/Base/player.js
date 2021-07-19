const ytdlDiscord = require("ytdl-core");
const shem = require('../../../MODELS/Temprorary/queue');
const Discord = require('discord.js');

module.exports = {
  async play(song, message, client) {

    const channel = message.member.voice.channel;
    const emm = new Discord.MessageEmbed().setColor("#2f3136");
    let concon;
    try {
      concon = await client.channels.cache.get(channel.id).join();
    } catch (error) {
      console.error(`Kanala Bağlanamadım: ${error}`);
      await shem.deleteOne({ _id: client.user.id });
      return message.channel.send(emm.setDescription(`Bir hata oluştu!`)).catch(console.error);
    };
    const queueConstruct = {
      textChannel: message.channel,
      channel: client.channels.cache.get(channel.id),
      connection: await concon,
    };
    await client.queue.set(client.user.id, queueConstruct);
    const queue = client.queue.get(client.user.id);
    if (!song) {
      await queue.channel.leave();
      await shem.deleteOne({ _id: client.user.id });
      await client.queue.delete(client.user.id);
      return queue.textChannel.send("🚫 Sıra Sonlandı.").catch(console.error);
    }
    const embed = new Discord.MessageEmbed()
      .addField("Şuan Çalıyor", `[${song.title}](https://www.youtube.com/watch?v=${song.id})`, true)
      .addField("Kanal", `[${song.channel.name}](${song.channel.url})`, true)
      .addField("İzlenme Sayısı", song.viewCount, true)
      .setThumbnail(song.thumbnail);
    let box = await shem.findOne({ _id: client.user.id });
    if (!box) {
      await queue.channel.leave();
      await client.queue.delete(client.user.id);
      await shem.deleteOne({ _id: client.user.id });
    }
    try {
      var stream = ytdlDiscord(`https://www.youtube.com/watch?v=${song.id}`, { filter: "audioonly", highWaterMark: 1 << 25 });
    } catch (error) {
      if (queue) {
        box = await shem.findOne({ _id: client.user.id });
        await shem.updateOne({ _id: client.user.id }, { $inc: { no: 1 } });
        box = await shem.findOne({ _id: client.user.id });
        return module.exports.play(box.list[box.no], message, client);
      }

      if (error.message.includes("copyright")) {
        return message.channel
          .send(`Copyright`)
          .catch(console.error);
      } else {
        console.error(error);
      }
    }
    let dispatcher;
    try {
      dispatcher = queue.connection.play(stream, { quality: 'highestaudio', bitrate: 'auto' })
        .on("finish", async () => {
          box = await shem.findOne({ _id: client.user.id });
          if (!box) {
            await queue.channel.leave();
            await shem.deleteOne({ _id: client.user.id });
            return client.queue.delete(client.user.id);
          }
          if (box.loop) {
            let lastSong = box.list.shift();
            box.list.push(lastSong);
            await box.save();
            return module.exports.play(box.list[0], message, client);
          } else {
            await shem.updateOne({ _id: client.user.id }, { $inc: { no: 1 } });
            box = await shem.findOne({ _id: client.user.id });
            return module.exports.play(box.list[box.no], message, client);
          }
        })
        .on("error", async (err) => {
          console.error(err);
          box = await shem.findOne({ _id: client.user.id });
          await shem.updateOne({ _id: message.guid.id }, { $inc: { no: 1 } });
          box = await shem.findOne({ _id: client.user.id });
          return module.exports.play(box.list[box.no], message, client);
        });
    } catch (error) {
      return console.log(error);
    }
    dispatcher.setVolumeLogarithmic(box.volume / 200);
    try {
      var playingMessage = await client.channels.cache.get(queue.textChannel.id).send(embed);
      await shem.updateOne({ _id: client.user.id }, { playingMessage: playingMessage.id });
      await playingMessage.react("▶");
      await playingMessage.react("⏸");
      await playingMessage.react("🔁");
      await playingMessage.react("🔀");
      await playingMessage.react("⏭");
      await playingMessage.react("⛔");
    } catch (error) {

    }

    const filter = (reaction, user) => user.id !== client.user.id;

    const collector = playingMessage.createReactionCollector(filter, {
      time: song.duration > 0 ? song.duration * 1000 : 600000
    });


    collector.on("collect", async (reaction, user) => {
      let boxi = await shem.findOne({ _id: client.user.id });
      if (queue.connection.channel.members.every(member => member.id != user.id)) return reaction.users.remove(user);
      if (!queue) return;

      switch (reaction.emoji.name) {

        case "🔀":
          let songss = boxi.list;
          for (let i = songss.length - 1; i > 1; i--) {
            let j = 1 + Math.floor(Math.random() * i);
            [songss[i], songss[j]] = [songss[j], songss[i]];
          }
          shem.updateOne({ _id: client.user.id }, { list: songss });
          client.queue.set(client.user.id, queue);
          client.channels.cache.get(boxi.textChannel).send(`${user} 🔀 Sırayı karıştırdı!`).catch(console.error);
          reaction.users.remove(user);
          break;

        case "⏭":
          queue.playing = true;
          queue.connection.dispatcher.end();
          client.channels.cache.get(boxi.textChannel).send(`${user} ⏭ Sıradaki şarkıya geçti!`).catch(console.error);
          collector.stop();
          reaction.users.remove(user);
          break;

        case "⏸":
          if (queue.playing) client.channels.cache.get(boxi.textChannel).send(`${user} ⏸ Şarkıyı durdurdu!`).catch(console.error);
          //if (!queue.playing) break;
          boxi.playing = false;
          queue.connection.dispatcher.pause();
          reaction.users.remove(user);
          break;

        case "▶":
          //if (queue.playing) break;
          boxi.playing = true;
          queue.connection.dispatcher.resume();
          if (queue.playing) client.channels.cache.get(boxi.textChannel).send(`${user} ▶ Devam ettirdi!`).catch(console.error);
          reaction.users.remove(user);
          break;

        case "🔁":
          let boxii = await shem.findOne({ _id: client.user.id });
          boxii.loop = await shem.updateOne({ _id: client.user.id }, { loop: !boxii.loop });
          client.channels.cache.get(boxi.textChannel)
            .send(`Döngü ${user} tarafından ${!boxii.loop ? `**AÇILDI**` : `**KAPATILDI**`}`)
            .catch(console.error);
          reaction.users.remove(user);
          break;

        case "⛔":
          client.channels.cache.get(boxi.textChannel).send(`${user} ⏹ Şarkıyı kapattı!`).catch(console.error);
          await shem.deleteOne({ _id: client.user.id });
          try {
            if (queue.connection) queue.connection.dispatcher.end();
            await queue.channel.leave();
            await shem.deleteOne({ _id: client.user.id });
          } catch (error) {
            console.error(error);
            await queue.connection.disconnect();
          }
          collector.stop();
          break;

        default:
          break;
      }
    });


    collector.on("end", async () => {
      try {
        playingMessage.reactions.removeAll();
        playingMessage.delete({ timeout: 1500 });
      } catch (error) {

      }
    });
  }
};
