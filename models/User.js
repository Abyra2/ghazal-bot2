import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  rank: { type: String, default: null },
  xpMultiplier: { type: Number, default: 1 }
});

export default mongoose.model("User", userSchema);
