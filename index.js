const Discord = require('discord.js');
const irc = require('./DiscordOsuIRCBridge.js');
const config = require('./config.json')

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"], partials: ["MESSAGE","CHANNEL"]});

client.on('ready',()=>{
  console.log("I am online");
});

client.on('messageCreate', async message =>{
  if(!message.guild) return console.log("Command disabled in dms"); //thread cant be created in dms
  if(message.author.id !== config.author_id) return; //only author can use the command
  if(!message.content.startsWith(config.prefix))return

  const args = message.content.slice(config.prefix.length).split(/ +/);
  const command = args.shift();

  switch (command) {
    case 'osuJoin':
      if(message.channel.isThread()) return message.channel.send(`Command not available in threads`);
      const name = args.join(' ');
      if(!name) return message.channel.send(`Please enter a channel name`);
      await irc.osuJoin(message, message.author, name).catch(err => {console.log(err);})
      break;
    case 'mpMake':
      if(message.channel.isThread()) return message.channel.send(`Command not available in threads`);
      const mpName = args.join(' ');
      if(!mpName) return message.channel.send(`Please enter a channel name`);
      await irc.mpMake(message, message.author, mpName).catch(err => {console.log(err);})
      break;
    default:break;
  }
});




client.login(config.credentials.bot_token).catch(err => {
  console.log("Invalid bot_token");
	process.exit();
});
