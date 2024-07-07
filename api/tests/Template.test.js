process.env.NODE_ENV = "test";
const request = require("supertest");
const baseURL = "http://localhost:1234/templates";
const app = require("../app");
const sequelize = require("../database");
const { authenticateMiddleware } = require("../middlewares/auth");
const { auth } = require("firebase-admin");
jest.mock("../middlewares/auth");
var cron = require("node-cron");
jest.mock("node-cron");

describe("Templates", () => {
  let server;

  beforeAll(async () => {
    // intitalise the app
    server = app.listen(1234);
  });

  afterAll(async () => {
    // close the server
    await new Promise((resolve) => setTimeout(() => resolve(), 500));
    server.close();
  });

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
    authenticateMiddleware.mockImplementation((req, res, next) => {
      req.user = user1;
      next();
    });
    cron.schedule.mockImplementation((time, callback) => {});
  });

  afterEach(async () => {
    authenticateMiddleware.mockRestore();
    cron.schedule.mockRestore();
  });

  it("GET / should return all templates", async () => {
    const response = await request(baseURL).get("/");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("POST /create should create a new template", async () => {
    const response = await request(baseURL).post("/create").send({
      name: "Test Template",
      description: "Test Description",
      content: "Test Content",
    });

    expect(response.status).toBe(200);
    const template = response.body;
    expect(template.name).toBe("Test Template");
    expect(template.description).toBe("Test Description");
    expect(template.content).toBe("Test Content");
  });

  it("GET / should return all templates (2)", async () => {
    await request(baseURL).post("/create").send({
      name: "Test Template",
      description: "Test Description",
      content: "Test Content",
    });

    const response = await request(baseURL).get("/");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
  });

  it("POST /:id should update a template", async () => {
    const template = await sequelize.models.Template.create({
      name: "Test Template",
      description: "Test Description",
      content: "Test Content",
    });
    user1.addTemplate(template);
    const response = await request(baseURL).post(`/update`).send({
      id: 1,
      name: "Updated Template",
      description: "Updated Description",
      content: "Updated Content",
    });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Updated Template");
    expect(response.body.description).toBe("Updated Description");
    expect(response.body.content).toBe("Updated Content");
  });

  it("POST /:id should delete a template", async () => {
    const template = await sequelize.models.Template.create({
      name: "Test Template",
      description: "Test Description",
      content: "Test Content",
    });
    user1.addTemplate(template);
    var response = await request(baseURL).post(`/delete`).send({
      id: 1,
    });

    expect(response.status).toBe(200);
    expect(response.text).toBe("Template deleted.");
    expect(response.ok).toBe(true);
    const templates = await sequelize.models.Template.findAll();
    expect(templates.length).toBe(0);
    response = await request(baseURL).get("/");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it("POST /:id should not delete a template if it does not exist", async () => {
    const response = await request(baseURL).post(`/delete`).send({
      id: 1,
    });

    expect(response.status).toBe(404);
    expect(response.text).toBe("Template not found.");
    expect(response.ok).toBe(false);
  });

  it("POST :/id creating template, title should be at least 3 characters", async () => {
    const response = await request(baseURL).post("/create").send({
      name: "a",
      description: "Test Description",
      content: "Test Content",
    });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Name is too short.");
  });

  it("POST :/id creating template, title should be at most 18 characters", async () => {
    const response = await request(baseURL).post("/create").send({
      name: "aaaaaaaaaaaaaaaaaaa",
      description: "Test Description",
      content: "Test Content",
    });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Name is too long.");
  });

  it("POST :/id creating template, description should be at most 70 characters", async () => {
    const response = await request(baseURL)
      .post("/create")
      .send({
        name: "Test Template",
        description: "".padEnd(71, "a"),
        content: "Test Content",
      });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Description is too long.");
  });

  it("POST :/id creating template, content should be at most 1000 characters", async () => {
    const response = await request(baseURL)
      .post("/create")
      .send({
        name: "Test Template",
        description: "Test Description",
        content: "".padEnd(1001, "a"),
      });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Content is too long.");
  });

  it("POST :/id updating template, title should be at least 3 characters", async () => {
    const template = await sequelize.models.Template.create({
      name: "Test Template",
      description: "Test Description",
      content: "Test Content",
    });
    user1.addTemplate(template);
    const response = await request(baseURL).post(`/update`).send({
      id: 1,
      name: "a",
      description: "Updated Description",
      content: "Updated Content",
    });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Name is too short.");
  });

  it("POST :/id updating template, title should be at most 18 characters", async () => {
    const template = await sequelize.models.Template.create({
      name: "Test Template",
      description: "Test Description",
      content: "Test Content",
    });
    user1.addTemplate(template);
    const response = await request(baseURL).post(`/update`).send({
      id: 1,
      name: "aaaaaaaaaaaaaaaaaaa",
      description: "Updated Description",
      content: "Updated Content",
    });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Name is too long.");
  });

  it("POST :/id updating template, description should be at most 70 characters", async () => {
    const template = await sequelize.models.Template.create({
      name: "Test Template",
      description: "Test Description",
      content: "Test Content",
    });
    user1.addTemplate(template);
    const response = await request(baseURL)
      .post(`/update`)
      .send({
        id: 1,
        name: "Updated Template",
        description: "".padEnd(71, "a"),
        content: "Updated Content",
      });
  });

  it("POST :/id updating template, content should be at most 1000 characters", async () => {
    const template = await sequelize.models.Template.create({
      name: "Test Template",
      description: "Test Description",
      content: "Test Content",
    });
    user1.addTemplate(template);
    const response = await request(baseURL)
      .post(`/update`)
      .send({
        id: 1,
        name: "Updated Template",
        description: "Updated Description",
        content: "".padEnd(1001, "a"),
      });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Content is too long.");
  });

  it("POST :/id should not create a template if the user is not authenticated", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      res.status(401).send("Unauthorized");
    });

    const response = await request(baseURL).post("/create").send({
      name: "Test Template",
      description: "Test Description",
      content: "Test Content",
    });

    expect(response.status).toBe(401);
    expect(response.text).toBe("Unauthorized");
  });

  it("POST :/id template create, name is required", async () => {
    const response = await request(baseURL).post("/create").send({
      description: "Test Description",
      content: "Test Content",
    });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Name is required.");
  });

  it("POST :/id template create, content is required", async () => {
    const response = await request(baseURL).post("/create").send({
      name: "Test Template",
      description: "Test Description",
    });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Content is required.");
  });

  it("POST :/id can create template with empty description", async () => {
    const response = await request(baseURL).post("/create").send({
      name: "Test Template",
      content: "Test Content",
    });

    expect(response.status).toBe(200);
    const template = response.body;
    expect(template.name).toBe("Test Template");
    expect(template.description).toBe("");
    expect(template.content).toBe("Test Content");
  });

  it("POST :/id template update, name is required", async () => {
    const template = await sequelize.models.Template.create({
      name: "Test Template",
      description: "Test Description",
      content: "Test Content",
    });
    user1.addTemplate(template);
    const response = await request(baseURL).post("/update").send({
      id: 1,
      description: "Test Description",
      content: "Test Content",
    });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Name is required.");
  });

  it("POST :/id template update, content is required", async () => {
    const template = await sequelize.models.Template.create({
      name: "Test Template",
      description: "Test Description",
      content: "Test Content",
    });
    user1.addTemplate(template);
    const response = await request(baseURL).post("/update").send({
      id: 1,
      name: "Test Name",
      description: "Test Description",
    });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Content is required.");
  });

  it("POST :/id can update template with empty description", async () => {
    const templatemodel = await sequelize.models.Template.create({
      name: "Test Template",
      description: "Test Description",
      content: "Test Content",
    });
    user1.addTemplate(templatemodel);
    const response = await request(baseURL).post("/update").send({
      id: 1,
      name: "Test Name",
      content: "New Content",
    });

    const template = response.body;
    expect(response.status).toBe(200);

    expect(template.name).toBe("Test Name");
    expect(template.description).toBe("");
    expect(template.content).toBe("New Content");
  });

  it("POST /:id should not update a template if it does not exist", async () => {
    const response = await request(baseURL).post(`/update`).send({
      id: 1,
      name: "Updated Template",
      description: "Updated Description",
      content: "Updated Content",
    });

    expect(response.status).toBe(404);
    expect(response.text).toBe("Template not found.");
  });

  it("POST /:id should not update a template if it does not belong to the user", async () => {
    const template = await sequelize.models.Template.create({
      name: "Test Template",
      description: "Test Description",
      content: "Test Content",
    });
    const response = await request(baseURL).post(`/update`).send({
      id: 1,
      name: "Updated Template",
      description: "Updated Description",
      content: "Updated Content",
    });

    expect(response.status).toBe(404);
    expect(response.text).toBe("Template not found.");
  });

  it("POST /:id should not update a template if the user is not authenticated", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      res.status(401).send("Unauthorized");
    });

    const response = await request(baseURL).post(`/update`).send({
      id: 1,
      name: "Updated Template",
      description: "Updated Description",
      content: "Updated Content",
    });

    expect(response.status).toBe(401);
    expect(response.text).toBe("Unauthorized");
  });

  it("POST /:id should not delete a template if it does not belong to the user", async () => {
    const template = await sequelize.models.Template.create({
      name: "Test Template",
      description: "Test Description",
      content: "Test Content",
    });
    const response = await request(baseURL).post(`/delete`).send({
      id: 1,
    });

    expect(response.status).toBe(404);
    expect(response.text).toBe("Template not found.");
  });

  it("POST /:id should not delete a template if the user is not authenticated", async () => {
    authenticateMiddleware.mockImplementation((req, res, next) => {
      res.status(401).send("Unauthorized");
    });

    const response = await request(baseURL).post(`/delete`).send({
      id: 1,
    });

    expect(response.status).toBe(401);
    expect(response.text).toBe("Unauthorized");
  });
});
