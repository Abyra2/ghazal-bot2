import mongoose from "mongoose";

const rankSchema = new mongoose.Schema({
  guildId: String,
  level: Number,
  roleId: String,
  xpMultiplier: { type: Number, default: 1 },
  message: { type: String, default: null },
  image: { type: String, default: null }
});

export default mongoose.model("Rank", rankSchema);
