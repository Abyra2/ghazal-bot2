import { Client, GatewayIntentBits, Events } from "discord.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "./models/User.js";
import Rank from "./models/Rank.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch(err => console.log(err));

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});

function getRandomXP() { return Math.floor(Math.random() * 3) + 1; }
function xpToNextLevel(level) { return level * level * 50; }

async function sendLevelUpMessage(guild, user, level) {
  const rank = await Rank.findOne({ guildId: guild.id, level });
  if (!rank) return;

  const channel = guild.channels.cache.get(process.env.LVL_CHANNEL_ID);
  if (!channel) return;

  let content = rank.message || `${user} ارتقى إلى المستوى ${level}! 🎉`;
  if (rank.image) {
    channel.send({ content, files: [rank.image] });
  } else {
    channel.send({ content });
  }
}

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  let userData = await User.findOne({ userId: message.author.id, guildId: message.guild.id });
  if (!userData) userData = new User({ userId: message.author.id, guildId: message.guild.id });

  userData.xp += getRandomXP() * userData.xpMultiplier;

  while (userData.xp >= xpToNextLevel(userData.level)) {
    userData.xp -= xpToNextLevel(userData.level);
    userData.level += 1;

    const rank = await Rank.findOne({ guildId: message.guild.id, level: userData.level });
    if (rank) {
      if (rank.roleId) {
        const role = message.guild.roles.cache.get(rank.roleId);
        if (role) message.member.roles.add(role).catch(console.log);
      }
      sendLevelUpMessage(message.guild, message.member, userData.level);
      if (rank.xpMultiplier) userData.xpMultiplier = rank.xpMultiplier;
    }
  }

  await userData.save();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === "rank") {
    let user = interaction.options.getUser("user") || interaction.user;
    let userData = await User.findOne({ userId: user.id, guildId: interaction.guild.id });
    if (!userData) userData = new User({ userId: user.id, guildId: interaction.guild.id });

    let nextXP = xpToNextLevel(userData.level);
    interaction.reply(`${user} مستواك الحالي: **${userData.level}**\nXP الحالي: **${userData.xp}/${nextXP}**`);
  }

  if (!interaction.member.permissions.has("Administrator")) return;

  if (commandName === "setrank") {
    const level = interaction.options.getInteger("level");
    const role = interaction.options.getRole("role");
    const message = interaction.options.getString("message");
    const image = interaction.options.getString("image");
    const multiplier = interaction.options.getNumber("multiplier") || 1;

    let rank = await Rank.findOne({ guildId: interaction.guild.id, level });
    if (!rank) rank = new Rank({ guildId: interaction.guild.id, level });

    rank.roleId = role.id;
    rank.message = message;
    rank.image = image;
    rank.xpMultiplier = multiplier;

    await rank.save();
    interaction.reply(`تم تحديد رتبة ${role.name} للفل ${level}`);
  }

  if (commandName === "editxp") {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getNumber("amount");
    let userData = await User.findOne({ userId: user.id, guildId: interaction.guild.id });
    if (!userData) userData = new User({ userId: user.id, guildId: interaction.guild.id });

    userData.xp += amount;
    if (userData.xp < 0) userData.xp = 0;
    await userData.save();
    interaction.reply(`تم تعديل XP لـ ${user.tag} بمقدار ${amount}`);
  }
});

client.login(process.env.DISCORD_TOKEN);
