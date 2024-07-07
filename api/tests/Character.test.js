process.env.NODE_ENV = "test";
const request = require("supertest");
const baseURL = "http://localhost:1234/character";
const app = require("../app");
const sequelize = require("../database");
const { authenticateMiddleware } = require("../middlewares/auth");
jest.mock("../middlewares/auth");
var cron = require("node-cron");
jest.mock("node-cron");

describe("Character", () => {
  let server;

  beforeAll(async () => {
    // intitalise the app
    server = app.listen(1234);
  });

  beforeEach(async () => {
    await new Promise((resolve) => setTimeout(() => resolve(), 500));
    // reset the database
    await sequelize.sync({ force: true });

    character1 = await sequelize.models.Character.create({
      name: "Character 1",
      description: "Description 1",
      costInBananas: 100,
      isDefault: true,
    });

    character2 = await sequelize.models.Character.create({
      name: "Character 2",
      description: "Description 2",
      costInBananas: 2000,
      isDefault: false,
    });

    user1 = await sequelize.models.User.create({
      username: "user1",
      email: "user@email.com",
      uid: "1234",
      bananas: 1000,
    });

    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = user1;
      next();
    });
    cron.schedule.mockImplementation((time, callback) => {});
  });

  afterAll(async () => {
    // close the server
    await new Promise((resolve) => setTimeout(() => resolve(), 500));
    server.close();
  });

  afterEach(async () => {
    authenticateMiddleware.mockRestore();
    cron.schedule.mockRestore();
  });

  it("GET / should return all characters", async () => {
    const response = await request(baseURL).get("/");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
  });

  it("POST / should add a character to the database", async () => {
    const responseBefore = await request(baseURL).get("/");
    expect(responseBefore.status).toBe(200);
    expect(Array.isArray(responseBefore.body)).toBe(true);

    const newCharacter = {
      name: "Character 3",
      description: "Description 3",
      costInBananas: 300,
      isDefault: false,
    };
    const response = await request(baseURL).post("/").send(newCharacter);
    expect(response.status).toBe(201);

    const responseAfter = await request(baseURL).get("/");
    expect(responseAfter.status).toBe(200);
    expect(Array.isArray(responseAfter.body)).toBe(true);
    expect(responseAfter.body.length).toBe(3);
  });

  it("GET /available should return all characters not owned by a specific user", async () => {
    const response = await request(baseURL).get("/available");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
  });

  it("POST /purchase should purchase a character for a specific user", async () => {
    const responseBefore = await request(baseURL).get("/available");
    expect(responseBefore.status).toBe(200);
    expect(Array.isArray(responseBefore.body)).toBe(true);

    const characterToPurchase = responseBefore.body[0];
    const response = await request(baseURL)
      .post("/purchase")
      .send({ characterID: characterToPurchase.characterID });
    expect(response.status).toBe(201);

    const responseAfter = await request(baseURL).get("/available");
    expect(responseAfter.status).toBe(200);
    expect(Array.isArray(responseAfter.body)).toBe(true);
    expect(responseAfter.body.length).toBe(1);

    const user = await sequelize.models.User.findOne({
      where: { uid: "1234" },
    });
    expect(user.bananas).toBe(900);
  });

  it("POST /purchase should return 401 if user is not found", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      res.status(401).send("Unauthorized");
      next(new Error("Unauthorized"));
    });
    const response = await request(baseURL)
      .post("/purchase")
      .send({ characterID: 1 });
    expect(response.status).toBe(401);
    authenticateMiddleware.mockRestore();
  });

  it("POST /purchase should return 404 if character is not found", async () => {
    const response = await request(baseURL)
      .post("/purchase")
      .send({ characterID: 1234 });
    expect(response.status).toBe(404);
  });

  it("POST /purchase should return 403 if user does not have enough bananas", async () => {
    const response = await request(baseURL)
      .post("/purchase")
      .send({ characterID: 2 });
    expect(response.status).toBe(403);
  });

  it("GET /available should return 401 if user is not found", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      res.status(401).send("Unauthorized");
      next(new Error("Unauthorized"));
    });
    const response = await request(baseURL).get("/available");
    expect(response.status).toBe(401);
  });

  it("GET /available should return 500 if error", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = null;
      next();
    });
    await sequelize.models.User.drop();
    const response = await request(baseURL).get("/available");
    expect(response.status).toBe(500);
  });

  it("POST / should return 400 if name or isDefault are not provided", async () => {
    const response = await request(baseURL).post("/").send({ isDefault: true });
    expect(response.status).toBe(400);
  });

  it("GET / should return 500 if error", async () => {
    await sequelize.models.Character.drop();
    const response = await request(baseURL).get("/");
    expect(response.status).toBe(500);
  });

  it("POST /purchase should return 400 if uid or characterID are not provided", async () => {
    const response = await request(baseURL).post("/purchase");
    expect(response.status).toBe(400);
  });

  it("POST /purchase should return 500 if error", async () => {
    await sequelize.models.User.drop();
    const response = await request(baseURL)
      .post("/purchase")
      .send({ characterID: 1 });
    expect(response.status).toBe(500);
  });
});
