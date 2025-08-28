// src/socket.js
import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import messageModel from "../models/message.model.js";
import { generateText } from "../services/ai.service.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // JWT authentication middleware
  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!cookies.token)
      return next(new Error("Authentication error: No token provided"));

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await UserModel.findById(decoded.id || decoded.userId);

      if (!user)
        return next(new Error("Authentication error: User not found"));

      socket.user = {
        id: user._id.toString(),
        name: `${user.fullName.firstname} ${user.fullName.lastname}`,
        email: user.email,
      };

      next();
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.id})`);

    // Join chat rooms
    socket.on("join-chat", async (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.user.name} joined chat ${chatId}`);

      try {
        // Fetch chat history
        const messages = await messageModel
          .find({ chat: chatId })
          .sort({ createdAt: 1 })
          .populate("user", "fullName");

        const history = messages.map((msg) => ({
          username: msg.role === "user" ? msg.user?.fullName?.firstname ?? "Unknown" : "AI",
          message: msg.content,
        }));

        console.log(`💬 Chat history for chat ${chatId}:`);
        history.forEach((msg) => console.log(`${msg.username}: ${msg.message}`));

        socket.emit("chat-history", history);
      } catch (err) {
        console.error("Error fetching chat history:", err);
      }
    });

    // Handle AI messages
    socket.on("ai-message", async (data) => {
      console.log(`📩 Message from ${socket.user.name}: ${data.content}`);

      try {
        // Save user message
        await messageModel.create({
          user: socket.user.id,
          chat: data.chat,
          content: data.content,
          role: "user",
        });

        // Fetch last 10 messages for AI context
        const historyMessages = await messageModel
          .find({ chat: data.chat })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("user", "fullName");

        const chatContext = historyMessages
          .reverse() // oldest first
          .map((msg) => {
            const username = msg.role === "user" ? msg.user?.fullName?.firstname ?? "Unknown" : "AI";
            return `${username}: ${msg.content}`;
          })
          .join("\n");

        // Generate AI response with context
        const aiResponseText = await generateText(`${chatContext}\nUser: ${data.content}\nAI:`);

        // Save AI message
        await messageModel.create({
          user: null,
          chat: data.chat,
          content: aiResponseText,
          role: "model",
        });

        console.log(`💬 Chat update for chat ${data.chat}:`);
        console.log(`${socket.user.name}: ${data.content}`);
        console.log(`AI: ${aiResponseText}`);

        // Emit messages to room
        io.to(data.chat).emit("new-message", {
          username: socket.user.name,
          message: data.content,
        });

        io.to(data.chat).emit("new-message", {
          username: "AI",
          message: aiResponseText,
        });
      } catch (err) {
        console.error("Error handling AI message:", err);
        socket.emit("ai-response", {
          message: "Sorry, something went wrong.",
          chat: data.chat,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user.name} (${socket.id})`);
    });
  });

  return io;
};

// Helper to get io instance elsewhere
export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};
