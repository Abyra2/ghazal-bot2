import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const commands = [
  new SlashCommandBuilder().setName("rank").setDescription("عرض مستوى المستخدم"),
  new SlashCommandBuilder()
    .setName("setrank")
    .setDescription("تحديد رتبة لأي لفل")
    .addIntegerOption(o=>o.setName("level").setDescription("الفل المطلوب").setRequired(true))
    .addRoleOption(o=>o.setName("role").setDescription("الرتبة").setRequired(true))
    .addStringOption(o=>o.setName("message").setDescription("رسالة اللفل").setRequired(false))
    .addStringOption(o=>o.setName("image").setDescription("صورة رسالة").setRequired(false))
    .addNumberOption(o=>o.setName("multiplier").setDescription("مضاعفة XP").setRequired(false)),
  new SlashCommandBuilder()
    .setName("editxp")
    .setDescription("تعديل XP لأي عضو")
    .addUserOption(o=>o.setName("user").setDescription("المستخدم").setRequired(true))
    .addNumberOption(o=>o.setName("amount").setDescription("الكمية + أو -").setRequired(true))
].map(c=>c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
(async()=>{
  try{
    console.log("Registering commands...");
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {body: commands});
    console.log("Commands registered!");
  }catch(e){console.error(e);}
})();
