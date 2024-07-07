var express = require("express");
var router = express.Router();
const sequelize = require("../database");
const {
  log_error,
  add_xp_to_user,
  updateBadges,
  grantBadge,
} = require("../helpers/experience");

// GET operation to fetch all entries by user ID and sort them choronologically
router.get("/fetch_user_entries", async (req, res, next) => {
  const user = req.user;

  try {
    // Fetch all journals for a given user
    const journals = await sequelize.models.Journal.findAll({
      where: { UserUserID: user.userID },
      attributes: ["journalID"],
    });

    // Extract journal IDs
    const journalIds = journals.map((journal) => journal.journalID);

    // Fetch entries for these journals
    const userEntries = await sequelize.models.Entry.findAll({
      where: { JournalJournalID: journalIds },
      include: [
        {
          model: sequelize.models.Journal,
          as: "Journal",
          attributes: ["title", "UserUserID"],
        },
      ],
      order: [["date", "DESC"]], // Sorting entries in descending order
    });

    res.json(userEntries);
  } catch (error) {
    log_error("Error fetching user entries:", error);
    res.status(500).send("Internal server error");
  }
});


router.get("/find_entries", async (req, res, next) => {
  try {
    var user = req.user;
    if (!req.query.journalID) {
      return res.status(400).send("Missing journalID");
    }
    const entries = await sequelize.models.Entry.findAll({
      where: {
        JournalJournalID: req.query.journalID,
      },
      include: {
        model: sequelize.models.Journal,
        as: "Journal",
        include: {
          model: sequelize.models.User, // Include the User model
          as: "User",
        },
      },
      order: [["date", "DESC"]],
    });
    res.send(entries);
  } catch (error) {
    log_error("Error fetching entries:", error);
    res.status(500).send("Internal server error");
  }
});

// GET operation to fetch an entry by ID
router.get("/get_entry", async (req, res, next) => {
  try {
    var user = req.user;
    const entry = await sequelize.models.Entry.findByPk(req.query.id);

    if (!entry) {
      return res.status(404).send("Entry not found");
    }
    res.send(entry);
  } catch (error) {
    log_error("Error fetching entry:", error);
    res.status(500).send("Internal server error");
  }
});

// POST operation to update an entry by ID
router.post("/update_entry", async (req, res, next) => {
  try {
    var user = req.user;
    await add_xp_to_user(user, 1);
    const entry = await sequelize.models.Entry.findByPk(req.query.id);

    if (!entry) {
      return res.status(404).send("Entry not found");
    }
    entry.title = req.body.title;
    entry.content = req.body.content;
    entry.mood = req.body.mood;
    entry.isDraft = req.body.isDraft;
    entry.image = req.body.image;
    entry.path = req.body.path;

    await entry.save();
    res.send({ entry: entry, xp: 1});
  } catch (error) {
    log_error("Error updating entry:", error);
    res.status(500).send("Internal server error");
  }
});

router.post('/create_entry', async (req, res, next) => {
	try {
		var user = req.user; // Assuming req.user is already populated with the authenticated user's data
		const { date, title, content, mood, isDraft, JournalJournalID, image, path } = req.body;

		const entryDate = new Date(date); // Ensure this uses the date from the request if intending to capture the entry's date
		const entry = await sequelize.models.Entry.create({
			date: entryDate,
			title,
			content,
			mood,
			isDraft,
			image,
			path,
			JournalJournalID,
		});

		await sequelize.models.Journal.update(
			{ lastCreated: entryDate },
			{ where: { journalID: JournalJournalID } }
		);

		// Badge unlocking logic based on entry time
		const hours = entryDate.getHours();
		if (hours >= 5 && hours <= 11) {
			await grantBadge(user, 'morning');
		}
		if (hours >= 20 || hours <= 4) {
			await grantBadge(user, 'night');
		}

		// Badge for entry on January 1
		if (entryDate.getMonth() === 0 && entryDate.getDate() === 1) {
			await grantBadge(user, 'firstday');
		}

		// Logic for entry streaks and monthly entry counter
		const currentDate = new Date();
		let updateFields = { lastEntryDate: currentDate, entryCount: sequelize.literal('entryCount + 1') };

		const lastEntryDate = user.lastEntryDate ? new Date(user.lastEntryDate) : null;
		if (lastEntryDate) {
			const differenceInDays = Math.floor((currentDate - lastEntryDate) / (1000 * 60 * 60 * 24));
			if (differenceInDays === 1) {
				updateFields.entryDaysInARow = sequelize.literal('entryDaysInARow + 1');
			} else if (differenceInDays > 1) {
				updateFields.entryDaysInARow = 1; // Reset streak if a day was missed
			}
			if (currentDate.getMonth() !== lastEntryDate.getMonth() || currentDate.getFullYear() !== lastEntryDate.getFullYear()) {
				updateFields.monthlyEntryCounter = sequelize.literal('monthlyEntryCounter + 1');
			}
		} else {
			updateFields.entryDaysInARow = 1;
			updateFields.monthlyEntryCounter = 1;
		}

		await user.update(updateFields);
    const xp_gain = 1+Math.round(0.2*user.level)+Math.min(5, user.daysInARow);
    await add_xp_to_user(user, xp_gain);
    await user.update({ entryCount: user.entryCount + 1 });
    await user.reload();
    await updateBadges(user);

		// Update the lastCreated attribute of the Journal
		await sequelize.models.Journal.update(
			{ lastCreated: new Date() }, // Use the current date
			{ where: { journalID: JournalJournalID } }
		);

    res.send({ entry:entry, user: user.toJSON(), xp: xp_gain });

	} catch (error) {
		log_error("Error creating entry:", error);
		res.status(500).send("Internal server error");
	}
});

// POST operation to delete an entry by ID
router.post("/delete_entry", async (req, res, next) => {
  try {
    var user = req.user;
    const entry = await sequelize.models.Entry.findByPk(req.body.id);
    if (!entry) return res.status(400).send("Entry not found");

    entry.destroy();
    res.status(200).send("Entry deleted");
  } catch (error) {
    log_error("Error fetching entry:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/fetch_friends_entries", async (req, res) => {
  var user = req.user;

  try {
    // Fetch friends of the user
    const friends = await sequelize.models.Friend.findAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { fromID: user.userID, status: "accepted" },
          { toID: user.userID, status: "accepted" },
        ],
      },
    });
    const friendIDs = friends.map((friend) =>
      friend.fromID === user.userID ? friend.toID : friend.fromID
    );

    // Fetch non-private journals owned by friends
    const nonPrivateJournals = await sequelize.models.Journal.findAll({
      where: {
        UserUserID: {
          [sequelize.Sequelize.Op.in]: friendIDs,
        },
        isPrivate: false,
      },
      attributes: ["journalID"],
    });
    const journalIDs = nonPrivateJournals.map((journal) => journal.journalID);

    // Fetch entries from these journals
    const entries = await sequelize.models.Entry.findAll({
      where: {
        JournalJournalID: {
          [sequelize.Sequelize.Op.in]: journalIDs,
        },
      },
      include: [
        {
          model: sequelize.models.Journal,
          as: "Journal",
          attributes: ["title", "UserUserID"],
          include: [
            {
              model: sequelize.models.User,
              attributes: ["username", "favPfp", "favBadge"],
            },
          ],
        },
      ],
      order: [["date", "DESC"]],
    });

    res.json(entries);
  } catch (error) {
    log_error("Error fetching friends' entries:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
