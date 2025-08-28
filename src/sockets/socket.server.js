// src/socket.js
import { Server } from "socket.io";


export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // your frontend URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("sendMessage", (data) => {
      console.log("Message received:", data);
      io.emit("receiveMessage", data); // broadcast to all clients
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Optional helper to get io instance elsewhere
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
