const mongoose = require("mongoose");

const repoReferenceSchema = new mongoose.Schema({
  raw: { type: String, required: true },
  owner: { type: String, required: true },
  repoName: { type: String, required: true },
  filePath: { type: String, default: "" },
  metadata: {
    description: { type: String, default: "" },
    stars: { type: Number, default: 0 },
    language: { type: String, default: "" },
    url: { type: String, default: "" },
  },
}, { _id: false });

const messageSchema = new mongoose.Schema(
  {
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxLength: [2000, "Message cannot exceed 2000 characters"],
    },
    clientMessageId: {
      type: String,
      index: true,
    },
    repoReferences: [repoReferenceSchema],
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    deliveredAt: { type: Date },
    readAt: { type: Date },
  },
  { timestamps: true }
);

messageSchema.index({ chatRoomId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
