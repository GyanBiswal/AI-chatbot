import http from "http";
import app from "./app.js";
import connectDB from "./db/db.js";
import dotenv from "dotenv";
import { initSocket } from "./sockets/socket.server.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
