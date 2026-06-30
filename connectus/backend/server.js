const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const users = {};
let messageHistory = [];

io.on("connection", (socket) => {
  socket.on("new-user-joined", (name) => {
    users[socket.id] = name;
    socket.emit("load-history", messageHistory);
    socket.broadcast.emit("user-connected", name);
  });

  socket.on("send-message", (message) => {
    const chatData = { message: message, name: users[socket.id] };
    messageHistory.push(chatData);
    if (messageHistory.length > 50) messageHistory.shift();
    socket.broadcast.emit("receive-message", chatData);
  });

  // Poori chat delete karne ka logic
  socket.on("clear-chat-request", () => {
    messageHistory = [];
    io.emit("chat-cleared"); // Sabko batao ki chat saaf ho gayi
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      socket.broadcast.emit("user-disconnected", users[socket.id]);
      delete users[socket.id];
    }
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`ConnectUs Live Server running on http://localhost:${PORT}`);
});
