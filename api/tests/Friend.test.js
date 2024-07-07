process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const sequelize = require("../database");
const { authenticateMiddleware } = require("../middlewares/auth");
const { Op } = require("sequelize");
jest.mock("../middlewares/auth");
var cron = require("node-cron");
jest.mock("node-cron");

describe("Friend API", () => {
  let server;
  let user1, user2;

  beforeEach(async () => {
    await new Promise((resolve) => setTimeout(() => resolve(), 500));
    await sequelize.sync({ force: true });

    user1 = await sequelize.models.User.create({
      username: "user1",
      email: "user1@test.com",
      uid: "uid1",
      registrationDate: new Date(),
      lastLoginDate: new Date(),
    });

    user2 = await sequelize.models.User.create({
      username: "user2",
      email: "user2@test.com",
      uid: "uid2",
      registrationDate: new Date(),
      lastLoginDate: new Date(),
    });

    user3 = await sequelize.models.User.create({
      username: "user3",
      email: "user3@test.com",
      uid: "uid3",
      registrationDate: new Date(),
      lastLoginDate: new Date(),
    });

    user4 = await sequelize.models.User.create({
      username: "user4",
      email: "user4@test.com",
      uid: "uid4",
      registrationDate: new Date(),
      lastLoginDate: new Date(),
    });

    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = user1; // Simulate user1 as the logged-in user
      next();
    });
    cron.schedule.mockImplementation((time, callback) => {});
  });

  beforeAll(async () => {
    server = app.listen(1234);
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(() => resolve(), 500));
    server.close();
  });

  afterEach(async () => {
    authenticateMiddleware.mockRestore();
    cron.schedule.mockRestore();
  });

  it("POST /send should send a friend request successfully", async () => {
    const response = await request(app).post("/friends/send").send({
      fromID: user1.userID,
      toUsername: user2.username,
    });

    expect(response.status).toBe(201);
    const friendRequest = response.body;
    expect(friendRequest.fromID).toBe(user1.userID);
    expect(friendRequest.toID).toBe(user2.userID);
    expect(friendRequest.status).toBe("pending");
  });

  it("POST /send should send a friend request successfully without existing request or relation", async () => {
    // Ensure both users exist and no pending or accepted friend requests between them
    const user3Exists = await sequelize.models.User.findByPk(user3.userID);
    expect(user3Exists).toBeTruthy();

    const existingRequestOrFriend = await sequelize.models.Friend.findOne({
      where: {
        [Op.or]: [
          { fromID: user1.userID, toID: user3.userID },
          { fromID: user3.userID, toID: user1.userID },
        ],
      },
    });
    expect(existingRequestOrFriend).toBeNull();

    // Attempt to create a new friend request
    const response = await request(app).post("/friends/send").send({
      fromID: user1.userID,
      toUsername: user3.username,
    });

    // Assert the friend request was successfully created
    expect(response.status).toBe(201);
    const newFriendRequest = await sequelize.models.Friend.findOne({
      where: {
        fromID: user1.userID,
        toID: user3.userID,
        status: "pending",
      },
    });
    expect(newFriendRequest).not.toBeNull();
    expect(newFriendRequest.fromID).toBe(user1.userID);
    expect(newFriendRequest.toID).toBe(user3.userID);
    expect(newFriendRequest.status).toBe("pending");
  });

  it("GET /incoming should list incoming friend requests", async () => {
    await sequelize.models.Friend.create({
      fromID: user1.userID,
      toID: user2.userID,
      status: "pending",
    });

    const response = await request(app).get(
      `/friends/incoming?toID=${user2.userID}`
    );
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].fromUsername).toBe(user1.username);
  });

  it("POST /accept should accept a friend request", async () => {
    const friendRequest = await sequelize.models.Friend.create({
      fromID: user1.userID,
      toID: user2.userID,
      status: "pending",
    });

    const response = await request(app).post("/friends/accept").send({
      userID: user2.userID,
      friendID: friendRequest.friendID,
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Friend request accepted.");

    const updatedFriendRequest = await sequelize.models.Friend.findByPk(
      friendRequest.friendID
    );
    expect(updatedFriendRequest.status).toBe("accepted");
  });

  it("POST /decline should decline a friend request", async () => {
    const friendRequest = await sequelize.models.Friend.create({
      fromID: user1.userID,
      toID: user2.userID,
      status: "pending",
    });

    const response = await request(app).post("/friends/decline").send({
      userID: user2.userID,
      friendID: friendRequest.friendID,
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Friend request declined.");

    const checkFriendRequest = await sequelize.models.Friend.findByPk(
      friendRequest.friendID
    );
    expect(checkFriendRequest).toBeNull();
  });

  // describe("Friend API › GET /list should list all friends after accepting a friend request", () => {

  // });
  it("GET /list should list all friends after accepting a friend request", async () => {
    // Step 1: Create two users (Steve and Mary)
    let steve = await sequelize.models.User.create({
      username: "Steve",
      email: "steve@example.com",
      uid: "steveUID",
      registrationDate: new Date(),
      lastLoginDate: new Date(),
    });

    let mary = await sequelize.models.User.create({
      username: "Mary",
      email: "mary@example.com",
      uid: "maryUID",
      registrationDate: new Date(),
      lastLoginDate: new Date(),
    });

    // Step 2: Simulate Steve sending a friend request to Mary
    let friendRequest = await sequelize.models.Friend.create({
      fromID: steve.userID,
      toID: mary.userID,
      status: "pending",
    });

    // Step 3: Simulate Mary accepting the friend request
    await friendRequest.update({ status: "accepted" });

    // Step 4: Adjust authentication mock to reflect Mary as the authenticated user
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = mary;
      next();
    });

    // Step 5: Query Mary's friend list and validate it includes Steve
    const response = await request(app).get("/friends/list");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    const friendUsernames = response.body.map((friend) => friend.username);
    expect(friendUsernames).toContain(steve.username);
  });

  it("POST /remove should remove a friend", async () => {
    const friend = await sequelize.models.Friend.create({
      fromID: user1.userID,
      toID: user2.userID,
      status: "accepted",
    });

    const response = await request(app).post("/friends/remove").send({
      userID: user1.userID,
      friendID: user2.userID,
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Friend removed successfully.");

    const checkFriend = await sequelize.models.Friend.findByPk(friend.friendID);
    expect(checkFriend).toBeNull();
  });

  it("POST /send should return error if fromID or toUsername is missing", async () => {
    const response = await request(app).post("/friends/send").send({});
    expect(response.status).toBe(400);
    expect(response.text).toContain("sender ID and receiver username required");
  });

  it("POST /send should return error when sending request to oneself", async () => {
    const response = await request(app).post("/friends/send").send({
      fromID: user1.userID,
      toUsername: user1.username,
    });
    expect(response.status).toBe(400);
    expect(response.text).toContain(
      "You cannot send a friend request to yourself!"
    );
  });

  it("POST /send should return error when receiver does not exist", async () => {
    const response = await request(app).post("/friends/send").send({
      fromID: user1.userID,
      toUsername: "nonexistentuser",
    });
    expect(response.status).toBe(404);
    expect(response.text).toContain("Receiver not found.");
  });

  it("POST /accept should return error if friend request does not exist", async () => {
    const response = await request(app).post("/friends/accept").send({
      userID: user1.userID,
      friendID: 999, // Assuming this ID does not exist
    });
    expect(response.status).toBe(404);
    expect(response.text).toContain("Friend request not found.");
  });

  it("POST /decline should return error if pending friend request not found", async () => {
    const response = await request(app).post("/friends/decline").send({
      userID: user1.userID,
      friendID: 999, // Assuming this ID does not exist
    });
    expect(response.status).toBe(404);
    expect(response.text).toContain("Pending friend request not found.");
  });

  it("POST /remove should return error if friend relation does not exist", async () => {
    const response = await request(app).post("/friends/remove").send({
      userID: user1.userID,
      friendID: user2.userID, // Assuming no existing friend relation
    });
    expect(response.status).toBe(404);
    expect(response.text).toContain("Friend entry not found");
  });

  it("POST /send should not allow sending a friend request when one already exists", async () => {
    // Create a pending friend request from user1 to user2
    await sequelize.models.Friend.create({
      fromID: user1.userID,
      toID: user2.userID,
      status: "pending",
    });

    // Attempt to create another friend request from user1 to user2
    const response = await request(app).post("/friends/send").send({
      fromID: user1.userID,
      toUsername: user2.username,
    });
    expect(response.status).toBe(409);
    expect(response.text).toContain(
      "There is already a pending request with this user!"
    );
  });

  it("POST /remove should return error if no friendship exists to remove", async () => {
    const response = await request(app).post("/friends/remove").send({
      userID: user1.userID,
      friendID: user2.userID,
    });
    expect(response.status).toBe(404);
    expect(response.text).toContain("Friend entry not found");
  });

  // Testing uncovered lines in the /send route
  it("POST /send should handle unexpected server error during friend request sending", async () => {
    // Mock sequelize.models.User.findOne to throw an error
    sequelize.models.User.findOne = jest.fn().mockImplementation(() => {
      throw new Error("Unexpected server error");
    });

    const response = await request(app).post("/friends/send").send({
      fromID: user3.userID,
      toUsername: user4.username,
    });

    expect(response.status).toBe(500);
    expect(response.text).toContain("Unexpected server error");
  });

  // Testing uncovered lines in the /accept route
  it("POST /accept should handle unexpected server error during friend request acceptance", async () => {
    // Mock sequelize.models.Friend.findOne to throw an error
    sequelize.models.Friend.findOne = jest.fn().mockImplementation(() => {
      throw new Error("Unexpected server error");
    });

    const response = await request(app).post("/friends/accept").send({
      userID: user4.userID,
      friendID: 1, // Assuming this friend request exists
    });

    expect(response.status).toBe(500);
    expect(response.text).toContain("Unexpected server error");
  });

  // Testing uncovered lines in the /decline route
  it("POST /decline should handle unexpected server error during friend request decline", async () => {
    // Mock sequelize.models.Friend.findOne to throw an error
    sequelize.models.Friend.findOne = jest.fn().mockImplementation(() => {
      throw new Error("Unexpected server error");
    });

    const response = await request(app).post("/friends/decline").send({
      userID: user4.userID,
      friendID: 1, // Assuming this friend request exists
    });

    expect(response.status).toBe(500);
    expect(response.text).toContain("Unexpected server error");
  });

  // Testing uncovered lines in the /remove route
  it("POST /remove should handle unexpected server error during friend removal", async () => {
    // Mock sequelize.models.Friend.findOne to throw an error
    sequelize.models.Friend.findOne = jest.fn().mockImplementation(() => {
      throw new Error("Unexpected server error");
    });

    const response = await request(app).post("/friends/remove").send({
      userID: user3.userID,
      friendID: user4.userID,
    });

    expect(response.status).toBe(500);
    expect(response.text).toContain("Unexpected server error");
  });
  // Test to cover error handling in /list route
  it("GET /list should handle unexpected server error", async () => {
    sequelize.models.Friend.findAll = jest.fn().mockImplementation(() => {
      throw new Error("Unexpected server error");
    });

    const response = await request(app).get("/friends/list");
    expect(response.status).toBe(500);
    expect(response.text).toContain("Unexpected server error");
  });

  // Tests to cover error handling in /send route for missing fromID or toUsername
  it("POST /send should handle missing fromID or toUsername", async () => {
    let response = await request(app)
      .post("/friends/send")
      .send({ toUsername: "user2" });
    expect(response.status).toBe(400);
    expect(response.text).toContain("sender ID and receiver username required");

    response = await request(app).post("/friends/send").send({ fromID: 1 });
    expect(response.status).toBe(400);
    expect(response.text).toContain("sender ID and receiver username required");
  });

  // Test to cover error handling in /accept route
  it("POST /accept should handle missing userID or friendID", async () => {
    let response = await request(app)
      .post("/friends/accept")
      .send({ friendID: 1 });
    expect(response.status).toBe(400);
    expect(response.text).toContain("userID and friendID required");

    response = await request(app).post("/friends/accept").send({ userID: 1 });
    expect(response.status).toBe(400);
    expect(response.text).toContain("userID and friendID required");
  });

  // Test to cover error handling in /decline route
  it("POST /decline should handle missing userID or friendID", async () => {
    let response = await request(app)
      .post("/friends/decline")
      .send({ friendID: 1 });
    expect(response.status).toBe(400);
    expect(response.text).toContain("userID and friendID required");

    response = await request(app).post("/friends/decline").send({ userID: 1 });
    expect(response.status).toBe(400);
    expect(response.text).toContain("userID and friendID required");
  });

  // // Test to cover error handling in /remove route
  // it("POST /remove should handle missing userID or friendID", async () => {
  //   let response = await request(app)
  //     .post("/friends/remove")
  //     .send({ friendID: 1 });
  //   expect(response.status).toBe(400);
  //   expect(response.text).toContain("userID and friendID required");

  //   response = await request(app).post("/friends/remove").send({ userID: 1 });
  //   expect(response.status).toBe(400);
  //   expect(response.text).toContain("userID and friendID required");
  // });
});
