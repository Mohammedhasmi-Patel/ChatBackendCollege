import Conversation from "../Models/Conversation.model.js";
import Message from "../Models/Message.model.js";
import { getReceiverSocketId, io } from "../SocketIO/server.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id; // this is our current user

    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    // means there is no conversation
    if (!conversation) {
      conversation = await Conversation.create({
        members: [senderId, receiverId],
      });
    }

    // now communicate easyli
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id); // messages is array in Conversation Model
    }
    await Promise.all([conversation.save(), newMessage.save()]);
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.log(`error in sendMessage controller ${error}`);
    return res.status(500).json({ error: "internal server error" });
  }
};

// fetching all the message from the datbase
export const getMessage = async (req, res) => {
  try {
    const { id: chatUser } = req.params;
    const senderId = req.user._id; // this is our current user

    let conversation = await Conversation.findOne({
      members: { $all: [senderId, chatUser] },
    }).populate("messages");

    // there is no conversation yet

    if (!conversation) {
      return res.status(201).json([]);
    }

    // there is conversation done , so we need to fetch the data
    const messages = conversation.messages;
    return res.status(201).json(messages); // []
  } catch (error) {
    console.log(`error in getMessage controller ${error}`);
    res.status(500).json({ error: "internal server error..." });
  }
};
