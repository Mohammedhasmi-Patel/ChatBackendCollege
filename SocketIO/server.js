import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
    credentials: true, // Allow credentials if you need to send cookies
  },
});

// making function to handle real time message
export const getReceiverSocketId = (receiverId) => {
  return users[receiverId];
};

const users = {};

// useed to listen eveent on server side.
io.on("connection", (socket) => {
  console.log(`user connected ${socket.id}`);
  const userId = socket.handshake.query.userId;
  if (userId) {
    users[userId] = socket.id;
  }

  // use to send the message to all connected users.
  io.emit("getOnlineUsers", Object.keys(users));

  socket.on("disconnected", () => {
    console.log(`user disconnected ${socket.id}`);
    delete users[userId];
    io.emit("getOnlineUsers", Object.keys(users));
  });
});

export { app, io, server };
