const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

let rooms = {};

// Function to generate 10-digit Room ID
function generateRoomId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ All socket events go INSIDE connection handler
io.on("connection", (socket) => {
  console.log("🔌 New user connected:", socket.id);

  // Create Room
  socket.on("create-room", ({ name }, callback) => {
    const roomId = generateRoomId();
    rooms[roomId] = { players: [] };

    socket.join(roomId);
    rooms[roomId].players.push({ id: socket.id, name });

    console.log(`🏠 Room created: ${roomId} by ${name}`);
    io.to(roomId).emit("player-list", rooms[roomId].players);
    callback({ roomId });
  });

  // Join Room
  socket.on("join-room", ({ roomId, name }, callback) => {
    if (!rooms[roomId]) return callback({ success: false, message: "Room not found" });

    socket.join(roomId);
    rooms[roomId].players.push({ id: socket.id, name });

    io.to(roomId).emit("player-list", rooms[roomId].players);
    io.to(roomId).emit("chat-message", { sender: "System", message: `${name} joined the room.` });

    callback({ success: true, message: "Joined room", roomId });
  });

  // Leave Room
  socket.on("leave-room", ({ roomId, name }, callback) => {
    if (!rooms[roomId]) return callback({ success: false, message: "Room not found" });

    rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
    socket.leave(roomId);

    io.to(roomId).emit("player-list", rooms[roomId].players);
    io.to(roomId).emit("chat-message", { sender: "System", message: `${name} left the room.` });

    callback({ success: true, message: "Left room" });

    // Delete empty room
    if (rooms[roomId].players.length === 0) {
      delete rooms[roomId];
      console.log(`🗑️ Room deleted: ${roomId}`);
    }
  });

  // Chat
  socket.on("chat-message", ({ roomId, sender, message }) => {
    if (!rooms[roomId]) return;
    io.to(roomId).emit("chat-message", { sender, message });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    for (let roomId in rooms) {
      const player = rooms[roomId].players.find(p => p.id === socket.id);
      if (player) {
        rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
        io.to(roomId).emit("player-list", rooms[roomId].players);
        io.to(roomId).emit("chat-message", { sender: "System", message: `${player.name} disconnected.` });

        if (rooms[roomId].players.length === 0) {
          delete rooms[roomId];
          console.log(`🗑️ Room deleted: ${roomId}`);
        }
      }
    }
  });
});

server.listen(5001, () => {
  console.log("🚀 Server running on http://localhost:5001");
});
