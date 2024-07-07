process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const baseURL = "http://localhost:1234";
const sequelize = require("../database");
const { authenticateMiddleware } = require("../middlewares/auth");
const { auth } = require("firebase-admin");
const { throws } = require("assert");
jest.mock("../middlewares/auth")
jest.mock("../helpers/experience")
var cron = require("node-cron");
jest.mock("node-cron");

describe("Bookmark API", () => {
    let createdBookmarkId;
    let server;

    beforeAll(async () => {
        // intitalise the app
        server = app.listen(1234);
        
    });

    afterAll(async () => { 
        // close the server
        jest.clearAllMocks();
        await new Promise((resolve) => setTimeout(() => resolve(), 500));
        server.close()
        await new Promise((resolve) => setTimeout(() => resolve(), 500));
    });

    beforeEach(async () => {
        await sequelize.sync({force:true});
        const user = await sequelize.models.User.create({
            username: "user1",
            email: "test@test.com",
            uid: 1,
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

        const bookmark = await sequelize.models.Bookmark.create({
            bookmarkID:333,
            entryID:1,
            UserUserID:user.userID
        })

        authenticateMiddleware.mockImplementation((req, res, next) => {
            req.user = user;
            next();
        })
        cron.schedule.mockImplementation((time, callback) => {});
    });

    afterEach(async () => {
        authenticateMiddleware.mockRestore();
        jest.clearAllMocks();
    });


    it("POST /bookmark_entry should create a new bookmark at the entryID", async () => {
        const newBookmark = {
            bookmarkID:333,
            entryID: 1, 
            UserUserID: 1, 
        };

        const response = await request(baseURL)
            .post("/bookmarks/bookmark_entry?entryID=1")
            .send(newBookmark);

        expect(response.status)
        .toBe(201);
        expect(response.body.entryID)
        .toBe(newBookmark.entryID);
        expect(response.body.UserUserID)
        .toBe(newBookmark.UserUserID);
    });

    it("GET /fetch_journal_bookmarks should return all bookmarks for given journal and user", async () => {
        const response = await request(baseURL)
        .get("/bookmarks/fetch_journal_bookmarks?userId=1&journalID=1");
        expect(response.status)
        .toBe(200);
        expect(Array.isArray(response.body))
        .toBe(true);
    });

    it("GET /fetch_user_bookmarks should return all the bookmarks of user 1", async () => {
        const response = await request(baseURL)
        .get(`/bookmarks/fetch_user_bookmarks?UserUserID=1`);
        expect(response.status)
        .toBe(200);
        expect(Array.isArray(response.body))
        .toBe(true);
    });

    it("GET /check_bookmark should check if a bookmark exists", async () => {
        const response = await request(baseURL)
        .get("/bookmarks/check_bookmark?entryID=1&UserUserID=1");
        expect(response.status)
        .toBe(200);
        expect(response.body)
        .toHaveProperty('isBookmarked');
    });

    it("POST /delete_bookmark should delete an existing bookmark", async () => {
        const deleteBookmark = {
            entryID: 1,
            UserUserID: 1,
        };

        const response = await request(baseURL)
            .post("/bookmarks/delete_bookmark")
            .send(deleteBookmark);

        expect(response.status)
        .toBe(200); // Or the status code you expect for successful deletion
        expect(response.body)
        .toHaveProperty('message');
    });

    it("POST /bookmark_entry should return error for missing entryID or UserUserID", async () => {
        const incompleteBookmark = {
             UserUserID: 1
            };
        const response = await request(baseURL)
            .post("/bookmarks/bookmark_entry")
            .send(incompleteBookmark);
        expect(response.status)
        .toBe(400);
    });

    it("POST /delete_bookmark should return error for non-existent bookmark", async () => {
        const nonExistentBookmark = {
            entryID: 999,
            UserUserID: 999,
        };
        const response = await request(baseURL)
            .post("/bookmarks/delete_bookmark")
            .send(nonExistentBookmark);
        expect(response.status)
        .toBe(404);
    });

    it("GET /fetch_user_bookmarks should returns all bookmarks for nonexistent parameter UserUserID", async () => {
        //const invalidUserId = 99999;
        const response = await request(baseURL)
            .get(`/bookmarks/fetch_user_bookmarks`);
        expect(response.status)
        .toBe(200); 
        expect(Array.isArray(response.body))
        .toBe(true);
        expect(response.body).toHaveLength(1);
    });

    it("GET /fetch_journal_bookmarks should return error for non existent parameter userID and JournalID", async () => {
        const response = await request(baseURL)
            .get("/bookmarks/fetch_journal_bookmarks");
        expect(response.status)
        .toBe(400); // Or your expected error status code
    });

    // it("DELETE /delete_bookmark should delete a specific bookmark", async () => {
    //     const response = await request(baseURL).delete(`/bookmarks/${createdBookmarkId}`);
    //     expect(response.status).toBe(204); // Or the status code you expect
    // });

    // Add more tests as needed
});
