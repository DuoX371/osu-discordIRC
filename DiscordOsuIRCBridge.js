'use strict';

const Banchojs = require('bancho.js');
const Discord = require('discord.js');
const config = require('./config.json')

const client = new Banchojs.BanchoClient({
  username: config.credentials.osu_irc_username,
  password: config.credentials.osu_irc_password,
  apiKey: config.credentials.osu_api_key
});
client.connect();

const linkDiscordOsu = (thread, lobby, user) => {
  thread.createMessageCollector({
    filter: msg => msg.author.id === user.id,
    dispose: true
  }).on('collect', async msg => {
    const output = Discord.Util.cleanContent(msg.content, msg.channel)
      .replace(/<a?(:[^: \n\r\t]+:)\d+>/g, (found, text) => text);
    await lobby.sendMessage(output);
  });
  lobby.on('message', async msg => {
    if(msg.self) return;
    const name = msg.user.username ?? msg.user.ircUsername;
    const content = msg.message;
    const output = `\`${name}\`: ${content.replace(/[`*_<~|>]/g, found => '\\' + found)}`
      .replace(/https?:\/\/[^ \n\r\t]+/g, found => `<${found}>`);
    await thread.send({
      content: output,
      allowedMentions: { users: [], roles: [], repliedUser: false }
    });
  });
}

module.exports.osuJoin = async (msg, user, mpName) => {
  const mpLobby = client.getChannel(mpName);
  await mpLobby.join();
  const thread = await msg.channel.threads.create({
    name: 'osu IRC bridge',
    startMessage: msg
  });
  linkDiscordOsu(thread, mpLobby, user);
}

module.exports.mpMake = async (msg, user, mpName) => {
  const mpLobby = await client.createLobby(mpName);
  const thread = await msg.channel.threads.create({
    name: 'osu IRC bridge',
    startMessage: msg
  });
  linkDiscordOsu(thread, mpLobby, user);
}
