const Util = require('./Util.js');
const config = require('config');

class MessageHandler {
  constructor(bot) {
    this.bot = bot;
  }

  handle(message) {
    if (message.content === '!commands') {
      message.author.send(Util.commandsList());
      if (config.get('deleteMessages') === true)
        message.delete();
    } else if (message.content === '!mostplayed') {
      message.channel.send(Util.mostPlayedList());
      if (config.get('deleteMessages') === true)
        message.delete();
    } else if (message.content === '!add' && message.attachments.size > 0) {
      Util.addSounds(message.attachments, message.channel);
      if (config.get('deleteMessages') === true)
        message.delete();
    } else if (message.content.startsWith('!remove ')) {
      const sound = message.content.replace('!remove ', '');
      Util.removeSound(sound, message.channel);
      if (config.get('deleteMessages') === true)
        message.delete();
    } else if (message.content.startsWith('!rename ')) {
      const [oldsound, newsound] = message.content.replace('!rename ', '').split(' ');
      Util.renameSound(oldsound, newsound, message.channel);
      if (config.get('deleteMessages') === true)
        message.delete();
    } else if (message.content === '!disconnect') {
      this.bot.disconnectFromChannel();
      if (config.get('deleteMessages') === true)
        message.delete();
    } else {
      const sounds = Util.getSounds();
      if (message.content === '!sounds') {
        message.author.send(sounds.map(sound => sound));
      if (config.get('deleteMessages') === true)
        message.delete();
      } else {
        const voiceChannel = message.member.voiceChannel;
        if (voiceChannel === undefined) {
          message.reply('Join a voice channel first!');
        } else if (message.content === '!stop') {
          this.bot.queue = [];
        } else if (message.content === '!random') {
          const random = sounds[Math.floor(Math.random() * sounds.length)];
          this.bot.addToQueue(voiceChannel.id, random, message);
          if (config.get('stayInChannel') === true) {
            if (!this.bot.isSpeaking)
              this.bot.playSoundQueue();
          } else {
            if (this.bot.voiceConnections.array().length === 0) this.bot.playSoundQueue();
          }
        } else {
          const sound = message.content.split('!')[1];
          if (sounds.includes(sound)) {
            this.bot.addToQueue(voiceChannel.id, sound, message);
            if (config.get('stayInChannel') === true) {
              if (!this.bot.isSpeaking)
                this.bot.playSoundQueue();
            } else {
              if (this.bot.voiceConnections.array().length === 0) this.bot.playSoundQueue();
            }
          }
        }
      }
    }
  }
}

module.exports = MessageHandler;
