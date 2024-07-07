// app.js
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
var usersRouter = require("./routes/users");
const sequelize = require("./database");
var entriesRouter = require("./routes/entries");
var statisticsRouter = require("./routes/statistics");

var friendsRouter = require("./routes/friends");
var journalsRouter = require("./routes/journals");
var templatesRouter = require("./routes/templates");
var characterRouter = require("./routes/character");
var styleRouter = require("./routes/style");
const goalRouter = require("./routes/goals");
const notificationsRouter = require("./routes/notifications");
const unAuthentictedUser = require("./routes/signup");
const { authenticateMiddleware } = require("./middlewares/auth");

var app = express();

initializeApp({
  credential: cert(serviceAccount),
});

if (app.get("env") !== "test") {
  app.use(logger("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use("/users", unAuthentictedUser); // This route does not require authentication
app.use(authenticateMiddleware); // Apply authentication middleware to all routes below this line, automatically adding user to request
app.use("/users", usersRouter);
app.use("/entries", entriesRouter);
app.use("/bookmarks", require("./routes/bookmarks"));

app.use("/friends", friendsRouter);
app.use("/journals", journalsRouter);

app.use("/templates", templatesRouter);

app.use("/character", characterRouter);
app.use("/style", styleRouter);

app.use("/goals", goalRouter);
app.use("/statistics", statisticsRouter);
app.use("/notifications", notificationsRouter);
module.exports = app;
