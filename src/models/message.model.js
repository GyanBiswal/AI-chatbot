// src/models/message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat",
    },
    content: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "model", "system"],
      default: "user",
    },
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;
