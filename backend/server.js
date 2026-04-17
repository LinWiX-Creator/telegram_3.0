const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

let users = {};

function broadcastUsers() {
  io.emit("users_list", Object.values(users));
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    users[socket.id] = username;
    broadcastUsers();
  });

  socket.on("send_message", (message) => {
    io.emit("receive_message", {
      user: users[socket.id] || "Anon",
      message
    });
  });

  socket.on("private_message", ({ to, message }) => {
    const targetSocket = Object.keys(users).find(id => users[id] === to);
    if (targetSocket) {
      io.to(targetSocket).emit("receive_private", {
        from: users[socket.id],
        message
      });
    }
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    broadcastUsers();
  });
});

app.get("/", (req, res) => {
  res.send("Telegram 3.0 backend running 🚀");
});

server.listen(3000, () => {
  console.log("Server running on 3000");
});
