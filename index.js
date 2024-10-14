import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import UserRoute from "./Routes/User.route.js";
import messageRoute from "./Routes/Message.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./SocketIO/server.js";

dotenv.config();
const PORT = process.env.PORT;

// middleware
app.use(express.json());
app.use(cors({}));
app.use(cookieParser());

try {
  await mongoose.connect(process.env.MONGODBURI);
  console.log("database connection successful");
} catch (error) {
  console.log(`database connection error ${error}`);
}

app.get("/", (req, res) => {
  res.send("Hello Hasmi");
});

// routing
app.use("/api/user", UserRoute);
app.use("/api/message", messageRoute);

server.listen(PORT, () => {
  console.log(`server listening at ${PORT}`);
});
