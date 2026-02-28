// Get user data using userID
import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Connection from "../models/connection.js";
import User from "../models/User.js";

export const getUserData = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update user data
export const updateUserData = async (req, res) => {
  try {
    const { userId } = await req.auth();
    let { username, bio, location, full_name } = req.body;

    const tempUser = await User.findById(userId);
    if (!tempUser) {
      return res.json({ success: false, message: "User not found" });
    }

    !username && (username = tempUser.username);

    if (tempUser.username !== username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        // we will not change the username if it is already taken
        username = tempUser.username;
      }
    }

    const updatedData = {
      username,
      bio,
      location,
      full_name,
    };

    const profile = req.files?.profile?.[0];
    const cover = req.files?.cover?.[0];

    if (profile) {
      const buffer = fs.readFileSync(profile.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });

      const url = imagekit.url({
        path: response.filePath,
        transformation: [{ quality: "auto" }, { format: "webp" }, { width: "512" }],
      });
      updatedData.profile_picture = url;
    }

    if (cover) {
      const buffer = fs.readFileSync(cover.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: cover.originalname,
      });

      const url = imagekit.url({
        path: response.filePath,
        transformation: [{ quality: "auto" }, { format: "webp" }, { width: "1280" }],
      });
      updatedData.cover_photo = url;
    }

    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });

    res.json({ success: true, user, message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Find user using username, email,location,name

export const discoverUsers = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { input = "" } = req.body;

    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    });

    const filteredUsers = allUsers.filter((user) => user._id.toString() !== userId);

    res.json({ success: true, users: filteredUsers });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Follow user

export const followUser = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { id } = req.body;

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.following.includes(id)) {
      return res.json({ success: false, message: "You are already following this user" });
    }

    user.following.push(id);
    await user.save();

    toUser.followers.push(userId);
    await toUser.save();

    res.json({ success: true, message: "Now you are following this user" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Unfollow user

export const unfollowUser = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { id } = req.body;

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    user.following = user.following.filter((item) => item !== id);
    await user.save();

    toUser.followers = toUser.followers.filter((item) => item !== userId);
    await toUser.save();

    res.json({ success: true, message: "You are no longer following this user" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// send connetion request
export const sendConnetionRequest = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { id } = req.body;

    if (!id || id === userId) {
      return res.json({ success: false, message: "Invalid target user" });
    }

    // Check if user has sent more than 20 connection request in the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const connectionRequests = await Connection.find({
      from_user_id: userId,
      created_at: { $gt: last24Hours },
    });
    if (connectionRequests.length >= 20) {
      return res.json({
        success: false,
        message: "You have sent more than 20 connection requests in the last 24 hours",
      });
    }

    // Check if user are already connected
    const existingConnection = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: id },
        { from_user_id: id, to_user_id: userId },
      ],
    });

    if (!existingConnection) {
      await Connection.create({
        from_user_id: userId,
        to_user_id: id,
      });
      return res.json({ success: true, message: "Connection request sent successfully" });
    } else if (existingConnection.status === "accepted") {
      return res.json({ success: false, message: "You are already connected with this user" });
    }
    return res.json({ success: false, message: "Connection request pending" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get user connection
export const getUserConnetion = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const user = await User.findById(userId).populate("connections followers");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const connections = user.connections;
    const followers = user.followers;
    const following = user.following;

    const pendingConnection = (
      await Connection.find({ to_user_id: userId, status: "pending" }).populate("from_user_id")
    ).map((item) => item.from_user_id);

    res.json({ success: true, connections, followers, following, pendingConnection });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// Accept connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { id } = req.body;

    const connectionDoc = await Connection.findOne({ from_user_id: id, to_user_id: userId });

    if (!connectionDoc) {
      return res.json({ success: false, message: "Connection not found" });
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(id);
    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }
    if (!user.connections.includes(id)) user.connections.push(id);
    if (!toUser.connections.includes(userId)) toUser.connections.push(userId);
    await user.save();
    await toUser.save();

    connectionDoc.status = "accepted";
    await connectionDoc.save();
    return res.json({ success: true, message: "Connection accepted successfully" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
