const mongoose = require("mongoose");

const sharedResourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["repo", "file"],
    required: true,
  },
  owner: { type: String, required: true },
  repoName: { type: String, required: true },
  filePath: { type: String, default: "" },
  url: { type: String },
  metadata: {
    description: { type: String, default: "" },
    stars: { type: Number, default: 0 },
    language: { type: String, default: "" },
  },
  sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sharedAt: { type: Date, default: Date.now },
}, { _id: true });

const chatRoomSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: {
        validator: (val) => val.length === 2,
        message: "A chat room must have exactly 2 participants",
      },
      required: true,
    },
    lastMessage: {
      text: { type: String, default: "" },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date },
    },
    sharedResources: [sharedResourceSchema],
  },
  { timestamps: true }
);

chatRoomSchema.index({ participants: 1 });

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

module.exports = ChatRoom;
