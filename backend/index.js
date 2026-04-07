const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const players = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (data) => {
    console.log(`User ${socket.id} attempting to join with nickname: ${data.nickname}`);
    let baseName = (data.nickname || `Explorer_${socket.id.slice(0, 4)}`).trim();
    let finalName = baseName;
    let counter = 2;

    // Deduplication check
    const isNameTaken = (name) => Object.values(players).some(p => p.nickname.toLowerCase() === name.toLowerCase());
    
    while (isNameTaken(finalName)) {
      finalName = `${baseName} (${counter})`;
      counter++;
    }

    // Find a clear spawn point
    let spawnX = 2400 + Math.random() * 200;
    let spawnY = 2400 + Math.random() * 200;
    let attempts = 0;
    
    // Check if spawn point is too close to others (minimum 100px)
    while (Object.values(players).some(p => Math.hypot(p.x - spawnX, p.y - spawnY) < 100) && attempts < 15) {
      spawnX = 2400 + Math.random() * 200;
      spawnY = 2400 + Math.random() * 200;
      attempts++;
    }

    players[socket.id] = {
      id: socket.id,
      x: spawnX,
      y: spawnY,
      avatar: data.avatar,
      nickname: finalName,
      color: data.color || "#3b82f6"
    };
    console.log(`[DEDUPLICATION] Assigned unique nickname: ${finalName} with color: ${data.color}`);
    
    // Confirm the official name back to the player
    socket.emit("join-success", { id: socket.id, nickname: finalName });
    
    // Send existing players to the new player
    socket.emit("current-players", players);
    
    // Notify others about the new player
    socket.broadcast.emit("player-joined", players[socket.id]);
  });

  socket.on("move", (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      socket.broadcast.emit("player-moved", players[socket.id]);
    }
  });

  socket.on("chat-message", (data) => {
    const sender = players[socket.id];
    io.emit("chat-message", {
      id: socket.id,
      nickname: sender ? sender.nickname : "Unknown Explorer",
      message: data.message,
      timestamp: Date.now()
    });
  });

  const handleLeave = () => {
    if (players[socket.id]) {
      console.log("User left cosmos:", socket.id);
      delete players[socket.id];
      io.emit("player-left", socket.id);
    }
  };

  socket.on("leave", handleLeave);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    handleLeave();
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
