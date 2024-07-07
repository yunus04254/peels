process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const BASE_URL = "http://localhost:1234";
const sequelize = require("../database");
const { authenticateMiddleware } = require("../middlewares/auth");
jest.mock("../middlewares/auth");
var cron = require("node-cron");
const { auth } = require("firebase-admin");
const e = require("express");
jest.mock("node-cron");

describe("User API", () => {
  let server;
  beforeAll(async () => {
    server = app.listen(1234);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    await new Promise((resolve) => setTimeout(() => resolve(), 500));
    server.close();
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    const user1 = await sequelize.models.User.create({
      username: "user1",
      email: "test@test.com",
      uid: 3333,
      xp: 2000,
      favPfp: "test.png",
      registrationDate: new Date(),
      lastLoginDate: new Date(),
      daysInARow: 5,
    });

    const user2 = await sequelize.models.User.create({
      username: "user2",
      email: "test2@test2.com",
      uid: 4444,
      xp: 1000,
      favPfp: "test.png",
      registrationDate: new Date(),
      lastLoginDate: new Date(),
    });

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const user3 = await sequelize.models.User.create({
      username: "user3",
      email: "test3@test3.com",
      uid: 5555,
      xp: 500,
      registrationDate: new Date(),
      lastLoginDate: yesterday,
      daysInARow: 5,
    });

    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = user1; // assuming user1 is the logged in user
      next();
    });
    cron.schedule.mockImplementation((time, callback) => {});
  });

  afterEach(async () => {
    authenticateMiddleware.mockRestore();
    jest.clearAllMocks();
    cron.schedule.mockRestore();
  });

  it("GET / should return all users", async () => {
    const response = await request(BASE_URL).get("/users");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(3);
  });

  it("GET /top_100 should return top 100 users", async () => {
    const response = await request(BASE_URL).get("/users/top_100");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(3);
    expect(response.body[0].username).toBe("user1");
    expect(response.body[0].xp).toBe(2000);
    expect(response.body[1].username).toBe("user2");
    expect(response.body[1].xp).toBe(1000);
  });

  it("GET /top_100 should return 500 if error occurs", async () => {
    // drop table
    await sequelize.models.User.drop();
    const response = await request(BASE_URL).get("/users/top_100");
    expect(response.status).toBe(500);
  });

  it("POST /changeUsername should change the user's username", async () => {
    const newUsername = "user1_new";
    const response = await request(BASE_URL)
      .post("/users/changeUsername")
      .send({ newUsername });
    expect(response.status).toBe(200);
    expect(response.body.user.username).toBe(newUsername);
  });

  it("POST /changeUsername should return 400 if new username is not provided", async () => {
    const response = await request(BASE_URL).post("/users/changeUsername");
    expect(response.status).toBe(400);
  });

  it('POST /changeUsername should return 400 if new username already exists', async () => {
    const newUsername = "user2";
    const response = await request(BASE_URL)
      .post("/users/changeUsername")
      .send({ newUsername });
    expect(response.status).toBe(400);
  });

  it("POST /changeUsername should return 404 if user not found", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = null;
      next();
    });
    const response = await request(BASE_URL)
      .post("/users/changeUsername")
      .send({ newUsername: "user1_new" });
    expect(response.status).toBe(404);
  });

  it("POST /changeUsername should return 500 if error occurs", async () => {
    await sequelize.models.User.drop();
    const response = await request(BASE_URL)
      .post("/users/changeUsername")
      .send({ newUsername: "user1_new" });
    expect(response.status).toBe(500);
  });

  it("GET /loggedInYesterday should check if user logged in yesterday", async () => {
    const response = await request(BASE_URL).get("/users/loggedInYesterday");
    expect(response.status).toBe(200);
    expect(response.body.loggedInYesterday).toBe(false);
    const user3 = await sequelize.models.User.findOne({ where: { username: "user3" } });
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = user3;
      next();
    });
    const response2 = await request(BASE_URL).get("/users/loggedInYesterday");
    expect(response2.status).toBe(200);
    expect(response2.body.loggedInYesterday).toBe(true);
  });

  it("GET /loggedInYesterday should check if user logged in yesterday (new user test)", async () => {
    const user4 = await sequelize.models.User.create({
      username: "user4",
      email: "test4@test4.com",
      uid: 6666,
      xp: 500,
      registrationDate: new Date(),
      lastLoginDate: null,
      daysInARow: 0,
    });
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = user4;
      next();
    });
    const response = await request(BASE_URL).get("/users/loggedInYesterday");
    expect(response.status).toBe(200);
    expect(response.body.loggedInYesterday).toBe(false);
  });

  it("GET /loggedInYesterday should return 404 if user not found", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = null;
      next();
    });
    const response = await request(BASE_URL).get("/users/loggedInYesterday");
    expect(response.status).toBe(404);
  });

  it("GET /loggedInToday should check if user logged in today", async () => {
    const response = await request(BASE_URL).get("/users/loggedInToday");
    expect(response.status).toBe(200);
    expect(response.body.loggedInToday).toBe(true);

    const user3 = await sequelize.models.User.findOne({ where: { username: "user3" } });
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = user3;
      next();
    });
    const response2 = await request(BASE_URL).get("/users/loggedInToday");
    expect(response2.status).toBe(200);
    expect(response2.body.loggedInToday).toBe(false);
  });

  it("GET /loggedInToday should check if user logged in today (new user test)", async () => {
    const user4 = await sequelize.models.User.create({
      username: "user4",
      email: "test4@test4.com",
      uid: 6666,
      xp: 500,
      registrationDate: new Date(),
      lastLoginDate: null,
      daysInARow: 0,
    });
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = user4;
      next();
    });
    const response = await request(BASE_URL).get("/users/loggedInToday");
    expect(response.status).toBe(200);
    expect(response.body.loggedInToday).toBe(false);
  });

  it("GET /loggedInToday should return 404 if user not found", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = null;
      next();
    });
    const response = await request(BASE_URL).get("/users/loggedInToday");
    expect(response.status).toBe(404);
  });

  it("GET /loggedInToday should return 500 if error occurs", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      throw new Error("Error occurred");
    });
    const response = await request(BASE_URL).get("/users/loggedInToday");
    expect(response.status).toBe(500);
  });

  it("POST /resetDaysInARow should reset the user's consecutive login days", async () => {
    const response = await request(BASE_URL).post("/users/resetDaysInARow");
    expect(response.status).toBe(200);
    expect(response.body.daysInARow).toBe(0);
  });

  it("GET /top_100 should return nothing if there are no users", async () => {
    await sequelize.models.User.destroy({ where: {} });
    const response = await request(BASE_URL).get("/users/top_100");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it("GET /top_100 should catch errors", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      throw new Error("Error");
    });
    const response = await request(BASE_URL).get("/users/top_100");
    expect(response.status).toBe(500);
    authenticateMiddleware.mockRestore();
  });

  it("GET /top_100 this month should return top 100 users this month", async () => {
    try {
        await sequelize.models.XPLog.create({
          xp_change: 100,
          UserUserID: 1,
        });
        await sequelize.models.XPLog.create({
          xp_change: 200,
          UserUserID: 1,
        });
        await sequelize.models.XPLog.create({
          xp_change: 10,
          UserUserID: 2,
        });
    } catch (error) {
      console.log(error);
    }
    const response = await request(BASE_URL).get("/users/top_100_this_month");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body[0].User.username).toBe("user1");
    expect(response.body[0].User.favPfp).toBe("test.png");
    expect(response.body[0].xp).toBe(300);
    expect(response.body[1].User.username).toBe("user2");
    expect(response.body[1].xp).toBe(10);
    expect(response.body[1].User.favPfp).toBe("test.png");
  });

  it("GET /top_100_this_month should catch errors", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      throw new Error("Error");
    });
    const response = await request(BASE_URL).get("/users/top_100_this_month");
    expect(response.status).toBe(500);
    authenticateMiddleware.mockRestore();
  });

  it("GET /top_100_this_month only sums xp changes this month", async () => {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    try {
        await sequelize.models.XPLog.create({
          xp_change: 100,
          UserUserID: 1,
          date: startDate,
        });
        await sequelize.models.XPLog.create({
          xp_change: 200,
          UserUserID: 1,
          date: startDate,
        });
        await sequelize.models.XPLog.create({
          xp_change: 10,
          UserUserID: 2,
          date: startDate,
        });
    } catch (error) {
      console.log(error);
    }
    const response = await request(BASE_URL).get("/users/top_100_this_month");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it("GET /characters should return all characters", async () => {
    try {
      //add 3 characters to user1
      await sequelize.models.Character.create({
        name: "char1",
        description: "desc1",
        costInBananas: 100,  
      });
      await sequelize.models.Character.create({
        name: "char2",
        description: "desc2",
        costInBananas: 200,  
      });
      await sequelize.models.Character.create({
        name: "char3",
        description: "desc3",
        costInBananas: 300,  
      });
      //add to character user many to many table 
      await sequelize.models.UserCharacter.create({
        UserUserID: 1,
        CharacterCharacterID: 1,
      });
      await sequelize.models.UserCharacter.create({
        UserUserID: 1,
        CharacterCharacterID: 2,
      });
      await sequelize.models.UserCharacter.create({
        UserUserID: 1,
        CharacterCharacterID: 3,
      });

    } catch (error) {
      console.log(error);
    }
    let response; 
    try {
      response = await request(BASE_URL).get("/users/characters?userId=1");
    } catch (error) {
      console.log(error);
    }
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    const characters = response.body[0].Characters;
    expect(characters.length).toBe(3);   
    //they can appear in any order , search for them 
    expect(characters.find(char => char.name === "char1")).toBeDefined();
    expect(characters.find(char => char.name === "char2")).toBeDefined();
    expect(characters.find(char => char.name === "char3")).toBeDefined();
    expect(characters.find(char => char.description === "desc1")).toBeDefined();
    expect(characters.find(char => char.description === "desc2")).toBeDefined();
    expect(characters.find(char => char.description === "desc3")).toBeDefined();
    expect(characters.find(char => char.costInBananas === 100)).toBeDefined();
    expect(characters.find(char => char.costInBananas === 200)).toBeDefined();
    expect(characters.find(char => char.costInBananas === 300)).toBeDefined();

  });

  it("GET /characters should catch errors", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      throw new Error("Error");
    });
    const response = await request(BASE_URL).get("/users/characters?userId=1");
    expect(response.status).toBe(500);
    authenticateMiddleware.mockRestore();
  });

  it("GET /updateFavCharacter should update the user's fav character", async () => {
      const response = await request(BASE_URL).post("/users/updateFavCharacter").send({favCharacter: "hello", user: {userID: 1}});
      expect(response.status).toBe(200);
      //find the user 
      const user = await sequelize.models.User.findOne({where: {username: "user1"}});
      expect(user.favPfp).toBe("hello");

  });

  it("GET /updateFavCharacter catches 404 if user is not found", async () => {
    //mock middleware
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = {userID: 100};
      next();
    });
    const response = await request(BASE_URL).post("/users/updateFavCharacter").send({favCharacter: "hello"});
    expect(response.status).toBe(404);
  });

  it("GET /updateFavCharacter catches 400 if no fav character is provided", async () => {
    const response = await request(BASE_URL).post("/users/updateFavCharacter");
    expect(response.status).toBe(400);
  });

  it("GET /updateFavCharacter catches errors", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = null; 
      next();
    });
    jest.spyOn(console, "error").mockImplementation(() => {}); 
    const response = await request(BASE_URL).post("/users/updateFavCharacter").send({favCharacter: "hello"});
    expect(response.status).toBe(500);
    authenticateMiddleware.mockRestore();
  });

  it("POST /updateFavBadge should update the user's fav badge", async () => {
    const response = await request(BASE_URL).post("/users/updateFavBadge").send({favBadge: "hello", user: {userID: 1}, uid: 3333});
    expect(response.status).toBe(200);
    //find the user
    const user = await sequelize.models.User.findOne({where: {username: "user1"}});
    expect(user.favBadge).toBe("hello");
  });

  it("POST /updateFavBadge catches 400 if uid is not found", async () => {
    //mock middleware
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = {userID: 100};
      next();
    });
    const response = await request(BASE_URL).post("/users/updateFavBadge").send({favBadge: "hello"});
    expect(response.status).toBe(400);
  });



  it("POST /resetDaysInARow should return 404 if user not found", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = null;
      next();
    });
    const response = await request(BASE_URL).post("/users/resetDaysInARow");
    expect(response.status).toBe(404);
  });

  it("POST /resetDaysInARow should return 500 if error occurs", async () => {
    await sequelize.models.User.drop();
    const response = await request(BASE_URL).post("/users/resetDaysInARow");
    expect(response.status).toBe(500);
  });

  it('POST /dailyLogin should update the user"s lastLoginDate, daysInARow and xp', async () => {
    const user3 = await sequelize.models.User.findOne({ where: { username: "user3" } });
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = user3;
      next();
    });
    const response = await request(BASE_URL).post("/users/dailyLogin");
    expect(response.status).toBe(200);
    const user = await sequelize.models.User.findOne({ where: { username: "user3" } });
    expect(user.lastLoginDate.getDate()).toBe((new Date()).getDate());
    expect(user.daysInARow).toBe(6);
    expect(user.xp).toBe(501);
  });

  it("POST /dailyLogin should return the user's current bananas", async () => {
    const response = await request(BASE_URL).post("/users/dailyLogin");
    expect(response.status).toBe(200);
    expect(response.body.bananas).toBe(0);
  });

  it("POST /dailyLogin should return 404 if user not found", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = null;
      next();
    });
    const response = await request(BASE_URL).post("/users/dailyLogin");
    expect(response.status).toBe(404);
  });

  it("POST /dailyLogin should return 500 if error occurs", async () => {
    await sequelize.models.User.drop();
    const response = await request(BASE_URL).post("/users/dailyLogin");
    expect(response.status).toBe(500);
  });

  it('POST /updateBananas should update the user"s bananas', async () => {
    const response = await request(BASE_URL).post("/users/updateBananas").send({ bananas: 10 });
    expect(response.status).toBe(200);
    const user = await sequelize.models.User.findOne({ where: { username: "user1" } });
    expect(user.bananas).toBe(10);
  });

  it("POST /updateBananas should return 404 if user not found", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = null;
      next();
    });
    const response = await request(BASE_URL).post("/users/updateBananas").send({ bananas: 10 });
    expect(response.status).toBe(404);
  });

  it("POST /updateBananas should return 500 if error occurs", async () => {
    await sequelize.models.User.drop();
    const response = await request(BASE_URL).post("/users/updateBananas").send({ bananas: 10 });
    expect(response.status).toBe(500);
  });

  it("POST /updateBananas should return 400 if bananas are not provided", async () => {
    const response = await request(BASE_URL).post("/users/updateBananas");
    expect(response.status).toBe(400);
  });

});
