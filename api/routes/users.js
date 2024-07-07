var express = require("express");
var router = express.Router();
const sequelize = require("../database");
const { Op } = require("sequelize");
const { startOfMonth, endOfMonth } = require("date-fns");
const { updateBadges, add_xp_to_user } = require("../helpers/experience");

/* GET users listing. */
router.get("/", async (req, res, next) => {
  const users = await sequelize.models.User.findAll();
  res.send(users);
});

router.get("/top_100", async (req, res, next) => {
  try {
    const users = await sequelize.models.User.findAll({
      limit: 100,
      order: [["xp", "DESC"]],
    });
    //send as array of user objects
    res.send(users);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/top_100_this_month", async (req, res, next) => {
  //query xp log group by user id and sum xp
  const currentDate = new Date();
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  try {
    const users = await sequelize.models.XPLog.findAll({
      attributes: [
        "UserUserID",
        [sequelize.fn("SUM", sequelize.col("xp_change")), "xp"],
      ],
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: ["UserUserID"],
      order: [[sequelize.literal("xp"), "DESC"]],
      limit: 100,
      include: {
        model: sequelize.models.User,
        attributes: ["username","favPfp"],
      },
    });
    res.send(users);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.post('/dailyLogin', async (req, res, next) => {
  try {
    const user = req.user;
    if (user) {
      await user.update({
        lastLoginDate: new Date(),
        daysInARow: sequelize.literal("daysInARow + 1"),
      });
      await add_xp_to_user(user, 1);
      await user.reload();
      await updateBadges(user);
      res.status(200).send({ bananas: user.bananas });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send(error.message);
  }
});


router.post('/updateBananas', async (req, res, next) => {
  const { bananas } = req.body;
  if (!bananas) {
    return res.status(400).send('Bananas are required.');
  }
  try {
    const user = req.user;
    if (user) {
      await user.update({
        bananas: sequelize.literal(`bananas + ${bananas}`),
      });
      res.status(200).send(user);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/loggedInYesterday", async (req, res, next) => {
  try {
    const user = req.user;
    if (user) {
      let lastLoginDate = new Date(user.lastLoginDate);
      if (user.lastLoginDate == null) {
        lastLoginDate = new Date();
      }
      const today = new Date();
      const dayAfterLastLogin = new Date(lastLoginDate);
      dayAfterLastLogin.setDate(lastLoginDate.getDate() + 1);
      return res.status(200).send({
        loggedInYesterday: dayAfterLastLogin.getDate() === today.getDate(),
      });
    } else {
      return res.status(404).send("User not found");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

router.get("/loggedInToday", async (req, res, next) => {
  try {
    const user = req.user;
    if (user) {
      let lastLoginDate = new Date(user.lastLoginDate);
      if (user.lastLoginDate == null) {
        return res.send({ loggedInToday: false });
      }
      const today = new Date();
      console.log(lastLoginDate.getDate() === today.getDate());
      return res
        .status(200)
        .send({ loggedInToday: lastLoginDate.getDate() === today.getDate() });
    } else {
      return res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/resetDaysInARow", async (req, res, next) => {
  try {
    const user = req.user;
    if (user) {
      user.daysInARow = 0;
      await user.save();
      return res.status(200).send(user);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/updateFavBadge", async (req, res) => {
  console.log("Received request for updateFavBadge:", req.body);

  const { uid, favBadge } = req.body;

  if (!uid) {
    console.log("Missing UID or favBadge in request:", req.body);
    return res.status(400).json({ message: "UID is required." });
  }

  try {
    console.log(`Attempting to find user with UID: ${uid}`);
    const user = await sequelize.models.User.findOne({ where: { uid } });

    if (user) {
      console.log(`User found. Updating favorite badge to: ${favBadge}`);
      user.favBadge = favBadge? favBadge : "";
      await user.save();
      console.log("Favorite badge updated successfully.");
      res.json({
        success: true,
        message: "Favorite badge updated successfully.",
        user: user.toJSON(),
      });
    } else {
      console.log("User not found with UID:", uid);
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating favorite badge:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/changeUsername", async (req, res) => {
  const { newUsername } = req.body;
  if (!newUsername) {
    return res.status(400).send("New username is required.");
  }

  try {
    const user = req.user;
    if (user) {
      const usernameTaken = await sequelize.models.User.findOne({
        where: { username: newUsername },
      });
      if (usernameTaken) {
        return res.status(400).send("Username is already taken.");
      } else {
        user.username = newUsername;
        await user.save();
        res
          .status(200)
          .send({ message: "Username changed successfully", user: user });
      }
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get('/characters', async (req, res) => {
  try {
    const userID = req.query.userId; 
    //find all characters which the user has
    const userWithCharacters = await sequelize.models.User.findAll({
      where: { userID: userID },
      include: sequelize.models.Character
    });

      if (!userWithCharacters) {
        return res.status(404).send('User not found');
      }

      res.send(userWithCharacters);
  } catch (error) {
    console.error('Failed to fetch user characters:', error);
    res.status(500).send(error.message);
  }
});

router.post('/updateFavCharacter', async (req, res) => {
  const {favCharacter } = req.body;
  if (!favCharacter) {
    return res.status(400).send('Character ID is required.');
  }

  try {
    const user = await sequelize.models.User.findByPk(req.user.userID);
    if (user) {
      user.favPfp = favCharacter;
      await user.save();
      res.status(200).send(user);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error updating favorite character:', error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
