process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const BASE_URL = "http://localhost:1234";
const sequelize = require('../database');
const {add_xp_to_user} = require('../helpers/experience');
const { add } = require("date-fns");
const { authenticateMiddleware } = require("../middlewares/auth");
const { auth } = require("firebase-admin");
var cron = require('node-cron');
jest.mock("../middlewares/auth");
jest.mock("../helpers/experience");
jest.mock("node-cron");

describe("Entry API", () => {
    let createdEntryId;
    let server;

    beforeAll(async () => {
        // initialize the app
        //add a delay before starting the server
        await new Promise((resolve) => setTimeout(() => resolve(), 1000));
        server = app.listen(1234);
    });

    afterAll(async () => {
        // close the server
        jest.clearAllMocks();
        await new Promise((resolve) => setTimeout(() => resolve(), 500));
        server.close();
    });

    beforeEach(async () => {
        await sequelize.sync({force:true});
        const user = await sequelize.models.User.create({
            username: "user1",
            email: "test@test.com",
            uid: 3333,
            registrationDate: new Date(),
            lastLoginDate: new Date(),
        });
        const journal = await sequelize.models.Journal.create({
            title: "journal1",
            theme: "Test Theme",
            reminder: "Reminder 1",
            creationDate: new Date(),
            isPrivate: true,
            image: "",
            UserUserID: user.userID
        });
        const entry = await sequelize.models.Entry.create({
            title: "entry1",
            content: "content",
            mood: "happy",
            isDraft: true,
            image: "image",
            date: new Date(),
            JournalJournalID: journal.journalID
        });

        authenticateMiddleware.mockImplementation((req, res, next) => {
            req.user = user;
            next();
        })
        cron.schedule.mockImplementation((time, callback) => {});
    });

    afterEach(async () => {
        authenticateMiddleware.mockRestore();
    });

    it("GET /find_entries should return all entries by journal ID", async () => {
        const response = await request(BASE_URL).get("/entries/find_entries?journalID=1");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);

        //The response of this call returns not only the entry buts its corresponding journal and user

        //check it gave the correct entry
        const entry = response.body[0];
        expect(entry.title).toBe("entry1");
        expect(entry.content).toBe("content");
        expect(entry.mood).toBe("happy");
        expect(entry.isDraft).toBe(true);
        //expect(entry.image).toBe("image");
        expect(entry.JournalJournalID).toBe(1);
        expect(entry.date).toBeDefined();

        //check it gave the correct journal
        expect(entry.Journal).toBeDefined();
        const journal = entry.Journal;
        expect(journal.title).toBe("journal1");
        expect(journal.theme).toBe("Test Theme");
        expect(journal.reminder).toBe("Reminder 1");
        expect(journal.isPrivate).toBe(true);
        //expect(journal.image).toBe("");
        expect(journal.UserUserID).toBe(1);
        expect(journal.creationDate).toBeDefined();

        //check it gave the correct user
        expect(journal.User).toBeDefined();
        const user = journal.User;
        expect(user.username).toBe("user1");
        expect(user.email).toBe("test@test.com");
        expect(user.uid).toBe("3333");
        expect(user.registrationDate).toBeDefined();
        expect(user.lastLoginDate).toBeDefined();
    });

    it("GET /find_entries returns empty array if no entries found", async () => {
        const response = await request(BASE_URL).get("/entries/find_entries?journalID=2");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    })

    it("GET /find_entries returns 400 if query param is invalid", async () => {
        const response = await request(BASE_URL).get("/entries/find_entries?journalID=");
        expect(response.status).toBe(400);
        expect(response.text).toBe("Missing journalID");
    })

    it("GET /find_entries returns 500 if unexpected error occurs", async () => {
        jest.spyOn(sequelize.models.Entry, 'findAll').mockImplementation(() => {
            throw new Error('Database error');
        });
        const response = await request(BASE_URL).get("/entries/find_entries?journalID=1");
        expect(response.status).toBe(500);
        expect(response.text).toBe("Internal server error");
        sequelize.models.Entry.findAll.mockRestore();
    })

    it("GET /get_entry should return an entry by valid ID", async () => {
        const response = await request(BASE_URL).get("/entries/get_entry?id=1");
        expect(response.status).toBe(200);
        const entry = response.body;
        expect(entry.title).toBe("entry1");
        expect(entry.content).toBe("content");
        expect(entry.mood).toBe("happy");
        expect(entry.isDraft).toBe(true);
        expect(entry.image).toBe("image");
        expect(entry.JournalJournalID).toBe(1);
        expect(entry.date).toBeDefined();
    });

    it("GET /get_entry should return 404 if entry not found", async () => {
        const response = await request(BASE_URL).get("/entries/get_entry?id=2");
        expect(response.status).toBe(404);
        expect(response.text).toBe("Entry not found");
    });

    it("GET /get_entry should return 500 if unexpected error occurs", async () => {
        jest.spyOn(sequelize.models.Entry, 'findByPk').mockImplementation(() => {
            throw new Error('Database error');
        });
        const response = await request(BASE_URL).get("/entries/get_entry?id=1");
        expect(response.status).toBe(500);
        expect(response.text).toBe("Internal server error");
        sequelize.models.Entry.findByPk.mockRestore();
    });

    it("POST /update_entry should update an entry by valid ID", async () => {
        const response = await request(BASE_URL).post("/entries/update_entry?id=1").send({
            title: "Updated Title",
            content: "Updated Content",
            mood: "sad",
            isDraft: false,
            image: "Updated Image"
        });
        expect(response.status).toBe(200);
        const entry = response.body.entry;
        expect(entry.title).toBe("Updated Title");
        expect(entry.content).toBe("Updated Content");
        expect(entry.mood).toBe("sad");
        expect(entry.isDraft).toBe(false);
        expect(entry.image).toBe("Updated Image");
        const xp = response.body.xp;
        expect(xp).toBe(1);
    });

    it("POST /update_entry should return 404 if entry not found", async () => {
        const response = await request(BASE_URL).post("/entries/update_entry?id=2").send({
            title: "Updated Title",
            content: "Updated Content",
            mood: "sad",
            isDraft: false,
            image: "Updated Image"
        });
        expect(response.status).toBe(404);
        expect(response.text).toBe("Entry not found");
    });

    it("POST /update_entry should return 500 if request body is invalid", async () => {
        const response = await request(BASE_URL).post("/entries/update_entry?id=1").send();
        expect(response.status).toBe(500);
        expect(response.text).toBe("Internal server error");
    });

    it("POST /create_entry should create a new valid entry", async () => {
        //mock the getUser function
        const updateFunc = jest.spyOn(sequelize.models.Journal, 'update');
        add_xp_to_user.mockImplementation((a,b) => {});
        const response = await request(BASE_URL).post("/entries/create_entry").send({
            title: "New Entry",
            content: "New Content",
            mood: "sad",
            isDraft: false,
            image: "New Image",
            date: new Date(),
            JournalJournalID: 1,
            uid: 3333,
        });
        expect(response.status).toBe(200);
        const {entry} = response.body;
        expect(entry.title).toBe("New Entry");
        expect(entry.content).toBe("New Content");
        expect(entry.mood).toBe("sad");
        expect(entry.isDraft).toBe(false);
        expect(entry.image).toBe("New Image");
        expect(entry.JournalJournalID).toBe(1);
        expect(entry.date).toBeDefined();
        //check there are 2 entries now
        const entries = await sequelize.models.Entry.findAll();
        expect(entries.length).toBe(2);
        //check that the last created field in journal has been updated
        expect(updateFunc).toHaveBeenCalled();
        updateFunc.mockRestore();
        //check that the user has been given xp
        expect(add_xp_to_user).toHaveBeenCalled();
        expect(add_xp_to_user).toHaveBeenCalledWith(expect.any(Object), 1);
        add_xp_to_user.mockRestore();
    });

    it("POST /create_entry should return 500 if request body is invalid", async () => {
        const response = await request(BASE_URL).post("/entries/create_entry").send();
        expect(response.status).toBe(500);
        expect(response.text).toBe("Internal server error");
    });

    it("POST /create_entry should return 401 if user token is invalid", async () => {
        authenticateMiddleware.mockImplementation((req, res, next) => {res.status(401).send("Unauthorized"); next(new Error('Unauthorized'))});
        const response = await request(BASE_URL).post("/entries/create_entry").send({
            title: "New Entry",
            content: "New Content",
            mood: "sad",
            isDraft: false,
            image: "New Image",
            date: new Date(),
            JournalJournalID: 1,
            uid: 3333,
        });
        expect(response.status).toBe(401);
        expect(response.text).toBe("Unauthorized");
        authenticateMiddleware.mockRestore();
    });

    it("POST /delete_entry should delete an entry by valid ID", async () => {
        const response = await request(BASE_URL).post("/entries/delete_entry").send({id: 1});
        expect(response.status).toBe(200);
        expect(response.text).toBe("Entry deleted");
        //check there are no entries now
        const entries = await sequelize.models.Entry.findAll();
        expect(entries.length).toBe(0);
    });

    it("POST /delete_entry should return 400 if entry not found", async () => {
        const response = await request(BASE_URL).post("/entries/delete_entry?id=2");
        expect(response.status).toBe(400);
        expect(response.text).toBe("Entry not found");
    });

    it("POST /delete_entry should return 500 if request body is invalid", async () => {
        //delete the database file
        jest.spyOn(sequelize.models.Entry, 'findByPk').mockImplementation(() => {
            throw new Error('Database error');
        });
        const response = await request(BASE_URL).post("/entries/delete_entry");
        expect(response.status).toBe(500);
        expect(response.text).toBe("Internal server error");
        sequelize.models.Entry.findByPk.mockRestore();
    });

    it("GET /fetch_user_entries should return all entries from all journals of a user", async () => {
        const journal2 = await sequelize.models.Journal.create({
            title: "journal2",
            theme: "Test Theme",
            reminder: "Reminder 1",
            creationDate: new Date(),
            isPrivate: true,
            image: "",
            UserUserID: 1
        });

        await sequelize.models.Entry.create({
            title: "entry2",
            content: "content",
            mood: "happy",
            isDraft: true,
            image: "image",
            date: new Date(),
            JournalJournalID: 2
        });
        const response = await request(BASE_URL).get("/entries/fetch_user_entries");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
        //check that it is ordered by date
        expect(response.body[0].title).toBe("entry2");
        expect(response.body[1].title).toBe("entry1");

    });

    it("GET /fetch_user_entries should return empty array if no entries found", async () => {
        await sequelize.models.Entry.destroy({where: {}});
        const response = await request(BASE_URL).get("/entries/fetch_user_entries");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    });

    it("GET /fetch_user_entries should return 500 if unexpected error occurs", async () => {
        jest.spyOn(sequelize.models.Entry, 'findAll').mockImplementation(() => {
            throw new Error('Database error');
        });
        const response = await request(BASE_URL).get("/entries/fetch_user_entries");
        expect(response.status).toBe(500);
        expect(response.text).toBe("Internal server error");
        sequelize.models.Entry.findAll.mockRestore();
        jest.clearAllMocks();
    });

    it("GET /fetch_friends_entries should return all entries from all friends of a user", async () => {

        const user2 = await sequelize.models.User.create({
            username: "user2",
            email: "test@cooltest.com",
            uid: 4444,
            registrationDate: new Date(),
            lastLoginDate: new Date(),
        })
        const journal2 = await sequelize.models.Journal.create({
            title: "journal2",
            theme: "Test Theme",
            reminder: "Reminder 1",
            creationDate: new Date(),
            isPrivate: false,
            image: "",
            UserUserID: 2
        });
        const entry2 = await sequelize.models.Entry.create({
            title: "entry2",
            content: "content",
            mood: "happy",
            isDraft: true,
            image: "image",
            date: new Date(),
            JournalJournalID: 2
        });
        const entry3 = await sequelize.models.Entry.create({
            title: "entry3",
            content: "content",
            mood: "happy",
            isDraft: true,
            image: "image",
            date: new Date(),
            JournalJournalID: 2
        });
        //make them friends
        await sequelize.models.Friend.create({
            fromID: 1,
            toID: 2,
            status: "accepted"
        });

        const response = await request(BASE_URL).get("/entries/fetch_friends_entries");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
        //check that it is ordered by date
        expect(response.body[0].title).toBe("entry3");
        expect(response.body[1].title).toBe("entry2");
        expect(response.body[0].JournalJournalID).toBe(2);
    });

    it("GET /fetch_friends_entries should return empty if users are friends but journal is private", async () => {
        const user2 = await sequelize.models.User.create({
            username: "user2",
            email: "awesome@email.com",
            uid: 4444,
            registrationDate: new Date(),
            lastLoginDate: new Date(),
        })
        const journal2 = await sequelize.models.Journal.create({
            title: "journal2",
            theme: "Test Theme",
            reminder: "Reminder 1",
            creationDate: new Date(),
            isPrivate: true,
            image: "",
            UserUserID: 2
        });
        const entry2 = await sequelize.models.Entry.create({
            title: "entry2",
            content: "content",
            mood: "happy",
            isDraft: true,
            image: "image",
            date: new Date(),
            JournalJournalID: 2
        });
        //make them friends
        await sequelize.models.Friend.create({
            fromID: 1,
            toID: 2,
            status: "accepted"
        });
        const response = await request(BASE_URL).get("/entries/fetch_friends_entries");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    });

    it("GET /fetch_friends_entries should return empty if no friends found", async () => {
        const response = await request(BASE_URL).get("/entries/fetch_friends_entries");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    });

    it("GET /fetch_friends_entries should return 500 if unexpected error occurs", async () => {
        jest.spyOn(sequelize.models.Friend, 'findAll').mockImplementation(() => {
            throw new Error('Database error');
        });
        const response = await request(BASE_URL).get("/entries/fetch_friends_entries");
        expect(response.status).toBe(500);
        expect(response.text).toBe("Internal server error");
        sequelize.models.Friend.findAll.mockRestore();
    });


});
