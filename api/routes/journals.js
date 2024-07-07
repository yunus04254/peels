var express = require("express");
var router = express.Router();
const sequelize = require("../database");
const { Op } = require("sequelize");
const cron = require("node-cron");
const { sendNotification } = require("../helpers/notifications");

router.get("/recent", async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.userID;
    const journals = await sequelize.models.Journal.findAll({
      where: { UserUserID: userId },
      order: [["lastCreated", "DESC"]],
      limit: 5,
    });
    res.json(journals);
  } catch (error) {
    console.error("Error fetching journals:", error);
    res.status(500).send(error.message);
  }
});

// GET operation to fetch journal by Journal ID
router.get("/get_journal", async (req, res, next) => {
  try {
    const journal = await sequelize.models.Journal.findByPk(req.query.id, {
      include: sequelize.models.Entry,
    });
    if (!journal) {
      return res.status(404).send("Journal not found");
    }
    res.send(journal);
  } catch (error) {
    console.error("Error fetching journal:", error);
    res.status(500).send("Internal server error");
  }
});

// GET operation to fetch journal by User ID
router.get("/get_user_journal", async (req, res, next) => {
  const user = req.user;
  const userID = user.userID;
  try {
    const journal = await sequelize.models.Journal.findAll({
      where: {
        UserUserID: userID,
      },
    });
    res.send(journal);
  } catch (error) {
    console.error("Error fetching journal:", error);
    res.status(500).send("Internal server error");
  }
});

// GET operation to fetch journals belonging to user's friends
router.get("/friends_journals", async (req, res) => {
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
        {
          model: sequelize.models.User,
          as: "Requester",
          attributes: ["userID"],
        },
        {
          model: sequelize.models.User,
          as: "Receiver",
          attributes: ["userID"],
        },
      ],
    });

    const friendIDs = friends.reduce((acc, friend) => {
      const friendID =
        friend.Requester.userID === parseInt(userID)
          ? friend.Receiver.userID
          : friend.Requester.userID;
      acc.add(friendID);
      return acc;
    }, new Set());

    let allJournals = [];

    for (let friendID of friendIDs) {
      const journals = await sequelize.models.Journal.findAll({
        where: {
          UserUserID: friendID,
          isPrivate: false,
        },

        include: [
          {
            model: sequelize.models.User,
            as: "User",
            attributes: ["username"],
          },
        ],
      });
      allJournals = allJournals.concat(
        journals.map((journal) => ({
          ...journal.toJSON(),
          ownerUsername: journal.User.username,
        }))
      );
    }

    res.json(allJournals);
  } catch (error) {
    console.error("Error fetching friends' journals:", error);
    res.status(500).send("Internal server error");
  }
});

// POST request to create a new journal
router.post("/", async (req, res) => {
  const user = req.user;
  const userID = user.userID;
  try {
    const { title, theme, reminder, isPrivate } = req.body;

    if (!title) {
      return res.status(400).send("Title is required.");
    }

    const journal = await sequelize.models.Journal.create({
      title,
      theme,
      creationDate: new Date(),
      isPrivate,
      UserUserID: userID,
      reminder,
    });

    res.status(201).json(journal);
  } catch (error) {
    console.error("Error creating journal:", error);
    res.status(500).send(error.message);
  }
});

module.exports = router;

// PUT request to update an existing journal
router.put("/:journalID", async (req, res) => {
  const { journalID } = req.params;
  const { title, theme, reminder, isPrivate } = req.body;
  const user = req.user;
  try {
    const journalToUpdate = await sequelize.models.Journal.findByPk(journalID);
    if (!journalToUpdate) {
      return res.status(404).send("Journal not found.");
    }
    if (journalToUpdate.UserUserID !== user.userID) {
      return res.status(401).send("Unauthorized");
    }

    if (reminder !== journalToUpdate.reminder) {
      const entries = await sequelize.models.Entry.findAll({
        where: { JournalJournalID: journalID },
      });
    }
    const isChangingToPrivate = !journalToUpdate.isPrivate && isPrivate;
    journalToUpdate.title = title || journalToUpdate.title;
    journalToUpdate.theme = theme || journalToUpdate.theme;
    journalToUpdate.reminder = reminder || journalToUpdate.reminder;
    journalToUpdate.isPrivate = isPrivate;
    await journalToUpdate.save();

    if (isChangingToPrivate) {
      const entries = await sequelize.models.Entry.findAll({
        where: { JournalJournalID: journalID },
      });

      for (const entry of entries) {
        await sequelize.models.Bookmark.destroy({
          where: {
            entryID: entry.entryID,
            UserUserID: {
              [Op.ne]: journalToUpdate.UserUserID,
            },
          },
        });
      }
    }

    res.json(journalToUpdate);
  } catch (error) {
    console.error("Error updating journal:", error);
    res.status(500).send(error.message);
  }
});

// DELETE operation
router.delete("/:journalID", async (req, res) => {
  const { journalID } = req.params;
  const user = req.user;

  try {
    const journalToDelete = await sequelize.models.Journal.findByPk(journalID);

    if (!journalToDelete) {
      return res.status(404).send("Journal not found.");
    }

    if (journalToDelete.UserUserID !== user.userID) {
      return res.status(401).send("Unauthorized");
    }

    await journalToDelete.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting journal:", error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
const reminderTimes = {
  "Reminder 1": 24 * 60 * 60 * 1000, // 1 day
  "Reminder 2": 3 * 24 * 60 * 60 * 1000, // 2 days
  "Reminder 3": 7 * 24 * 60 * 60 * 1000, // 7 days
}

// Schedule a cron job to send reminders for journals
const pattern = "*/10 * * * * *"
if (process.env.NODE_ENV !== "test"){
  Object.entries(reminderTimes).forEach(([time, remindIn]) => {
    cron.schedule(pattern, async () => {
      const journalsf = await sequelize.models.Journal.findAll({
        where: {
          "lastReminder": {
            [Op.lt]: new Date(new Date() - remindIn * 1000)
          }
        }
      });

      await journalsf.map(async (journal) => {
        journal.lastReminder = new Date();
        const user = await sequelize.models.User.findByPk(journal.UserUserID);
        if (user){
          // check if user doesnt already have a notification for this journal
          const notification = await sequelize.models.Notification.findOne({
            where: {
              title: "Journal Reminder",
              content: "Don't forget to write in your journal " + journal.title + "!",
              UserUserID: user.userID,
              redirect: "/journals/"+journal.journalID
            }
          });
          if (!notification) {
            await sendNotification(user, "Journal Reminder", "Don't forget to write in your journal " + journal.title + "!", "/journals/"+journal.journalID);
          }
        }
        await journal.save();
      });
    }, {
      scheduled: true,
      timezone: "Europe/London"
    });
  });
}