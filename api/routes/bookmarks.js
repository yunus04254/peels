var express = require('express');
var router = express.Router();
const sequelize = require('../database');
//var getUser = require('../auth/verify'); // Import the getUser function

router.post('/bookmark_entry', async (req, res, next) => {
    try {
        const user = req.user;
        const bookmark = await sequelize.models.Bookmark.create({
            entryID: req.body.entryID,
            UserUserID: user.userID
        });
        res.status(201).send(bookmark);
    } catch (error) {
        console.log(error)
        res.status(400).send(error.message);
    }
});

router.get('/fetch_journal_bookmarks', async (req, res, next) => {
    const user = req.user;
    const userID = user.userID;
    try {
        const bookmarks = await sequelize.models.Bookmark.findAll({
            where: { UserUserId: userID },
            include: [{
                model: sequelize.models.Entry,
                where: { JournalJournalID: req.query.journalID }
            }]
        });
        res.send(bookmarks);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.get('/check_bookmark', async (req, res) => {
    const user = req.user;
    try {
        const { entryID } = req.query;
        const bookmark = await sequelize.models.Bookmark.findOne({
            where: {
                entryID: Number(req.query.entryID),
                UserUserID: user.userID
            }
        });
        res.json({ isBookmarked: !!bookmark });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/delete_bookmark', async (req, res) => {
    const user = req.user;
    const UserUserID = user.userID;
    try {
      const entryID  = req.body.entryID;
      console.log(req.body);
      const result = await sequelize.models.Bookmark.destroy({
        where: {
          entryID: Number(entryID),
          UserUserID: Number(UserUserID)
        }
      });
      if(result > 0) {
        res.status(200).send({ message: 'Bookmark deleted successfully' });
      } else {
        res.status(404).send({ message: 'Bookmark not found' });
      }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

  router.get('/fetch_user_bookmarks', async (req, res) => {
    const user = req.user;
    const UserUserID = user.userID;
    try {
        const bookmarks = await sequelize.models.Bookmark.findAll({
            where: { UserUserID: user.userID },
            include: [{
                model: sequelize.models.Entry,
                required: true, // This ensures only bookmarks with valid entries are returned
                include: {
                    model: sequelize.models.Journal,
                    as: 'Journal',
                    include: {
                      model: sequelize.models.User, // Include the User model
                      as: 'User'
                  }
                }
            }]
        });
        res.status(200).send(bookmarks);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
