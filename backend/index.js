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
    players[socket.id] = {
      id: socket.id,
      x: 2400 + Math.random() * 200,
      y: 2400 + Math.random() * 200,
      avatar: data.avatar,
      nickname: data.nickname || `Explorer_${socket.id.slice(0, 4)}`
    };
    
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

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete players[socket.id];
    io.emit("player-left", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
