var express = require("express");
var router = express.Router();
const sequelize = require("../database");
const { Op } = require("sequelize");
const { sendNotification } = require("../helpers/notifications");

router.get("/list", async (req, res) => {
  const user = req.user;
  const userID = user.userID;

  try {
    const friends = await sequelize.models.Friend.findAll({
      where: {
        [Op.or]: [
          { fromID: userID, status: "accepted" },
          { toID: userID, status: "accepted" },
        ],
      },
      include: [
        { model: sequelize.models.User, as: "Requester" },
        { model: sequelize.models.User, as: "Receiver" },
      ],
    });

    const friendList = friends.map((friend) => {
      // Determine if the current user is the requester or the receiver
      // Then return the opposite party's details as the friend's details
      if (friend.Requester.userID === userID) {
        return { ...friend.Receiver.dataValues };
      } else {
        return { ...friend.Requester.dataValues };
      }
    });

    res.status(200).json(friendList);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/send", async (req, res) => {
  const { fromID, toUsername } = req.body;

  if (!fromID || !toUsername) {
    return res.status(400).send("sender ID and receiver username required");
  }

  try {
    const sender = await sequelize.models.User.findOne({
      where: { userID: fromID },
    });
    if (sender.username === toUsername) {
      return res
        .status(400)
        .send("You cannot send a friend request to yourself!");
    }

    const receiver = await sequelize.models.User.findOne({
      where: { username: toUsername },
    });
    if (!receiver) {
      return res.status(404).send("Receiver not found.");
    }

    const existingRequest = await sequelize.models.Friend.findOne({
      where: {
        [Op.or]: [
          { fromID: fromID, toID: receiver.userID },
          { fromID: receiver.userID, toID: fromID },
        ],
        status: "pending",
      },
    });

    if (existingRequest) {
      return res
        .status(409)
        .send("There is already a pending request with this user!");
    }

    const existingFriends = await sequelize.models.Friend.findOne({
      where: {
        [Op.or]: [
          { fromID: fromID, toID: receiver.userID },
          { fromID: receiver.userID, toID: fromID },
        ],
        status: "accepted",
      },
    });

    if (existingFriends) {
      return res.status(409).send("You are already friends with this user!");
    }
    const notification = await sendNotification(
      receiver,
      "Friend Request",
      "You have a new friend request from " + sender.username + "!",
      "/friends",
      "heart"
    );
    const toID = receiver.userID;

    const newFriendRequest = await sequelize.models.Friend.create({
      fromID,
      toID,
      status: "pending",
    });

    res.status(201).send(newFriendRequest);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/incoming", async (req, res) => {
  const { toID } = req.query;

  if (!toID) {
    return res.status(400).send("userID is required.");
  }

  try {
    const userExists = await sequelize.models.User.findByPk(toID);
    if (!userExists) {
      return res.status(404).send("User not found.");
    }

    const incomingRequests = await sequelize.models.Friend.findAll({
      where: {
        toID: toID,
        status: "pending",
      },
      include: [
        {
          model: sequelize.models.User,
          as: "Requester",
          attributes: ["userID", "username"],
        },
      ],
    });

    const simplifiedRequests = incomingRequests.map((request) => ({
      friendID: request.friendID,
      fromUsername: request.Requester.username,
    }));

    res.status(200).json(simplifiedRequests);
  } catch (error) {
    // console.error("Error fetching incoming friend requests:", error);
    res.status(500).send(error.message);
  }
});

router.post("/accept", async (req, res) => {
  const { userID, friendID } = req.body;

  if (!userID || !friendID) {
    return res.status(400).send("userID and friendID required");
  }

  try {
    const friendRequest = await sequelize.models.Friend.findOne({
      where: {
        friendID: friendID,
        toID: userID,
        status: "pending",
      },
    });

    if (!friendRequest) {
      return res.status(404).send("Friend request not found.");
    }

    await friendRequest.update({ status: "accepted" });

    res.status(200).send({ message: "Friend request accepted." });
  } catch (error) {
    // console.error("Error accepting friend request:", error);
    res.status(500).send(error.message);
  }
});

router.post("/decline", async (req, res) => {
  const { userID, friendID } = req.body;

  if (!userID || !friendID) {
    return res.status(400).send("userID and friendID required");
  }

  try {
    const friendRequest = await sequelize.models.Friend.findOne({
      where: {
        friendID: friendID,
        toID: userID,
        status: "pending",
      },
    });

    if (!friendRequest) {
      return res.status(404).send("Pending friend request not found.");
    }

    await friendRequest.destroy();

    res.status(200).send({ message: "Friend request declined." });
  } catch (error) {
    // console.error("Error declining friend request:", error);
    res.status(500).send(error.message);
  }
});

router.post("/remove", async (req, res) => {
  var user = req.user;
  const userID = user.userID;
  const { friendID } = req.body;

  if (!friendID) {
    return res.status(400).send("friendID required");
  }

  try {
    const friendRelation = await sequelize.models.Friend.findOne({
      where: {
        [Op.or]: [
          { fromID: userID, toID: friendID, status: "accepted" },
          { fromID: friendID, toID: userID, status: "accepted" },
        ],
      },
    });

    if (!friendRelation) {
      return res.status(404).send("Friend entry not found");
    }
    const friendUser = await sequelize.models.User.findOne({
      where: { userID: friendID },
    });
    const notification = await sendNotification(
      friendUser,
      "Friend Request",
      "You have been removed as a friend by " + userID + "!",
      "/friends",
      "heart"
    );
    await friendRelation.destroy();

    res.status(200).send({ message: "Friend removed successfully." });
  } catch (error) {
    // console.error("Error removing friend:", error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
