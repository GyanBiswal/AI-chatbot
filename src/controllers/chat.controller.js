import chatModel from "../models/chat.model.js";

const createChat = async (req, res) => {
  try {
    const { title } = req.body; 
    const user = req.user;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const chat = await chatModel.create({
      user: user.userId, // req.user comes from authMiddleware
      title,             
    });

    res.status(201).json({
      message: "Chat created successfully",
      chat:{
            _id: chat._id,
            title: chat.title,
            user: chat.user,
            lastActivity: chat.lastActivity
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export default createChat;
