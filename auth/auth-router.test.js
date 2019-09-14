const request = require("supertest");
const jwt = require("jsonwebtoken");
const server = require("../api/server");
const db = require("../database/dbConfig");

beforeEach(async () => {
  await db.from("users").truncate();
});

describe("POST /register", () => {
  it("should return a 400 when missing username or password", async () => {
    const missingPassword = { username: "george" };
    const missingUsername = { password: "fred" };
    const missingBoth = {};

    const firstRes = await request(server)
      .post("/api/auth/register")
      .send(missingPassword);

    const secondRes = await request(server)
      .post("/api/auth/register")
      .send(missingUsername);

    const thirdRes = await request(server)
      .post("/api/auth/register")
      .send(missingBoth);

    expect(firstRes.status).toBe(400);
    expect(secondRes.status).toBe(400);
    expect(thirdRes.status).toBe(400);
  });

  it("should send back 201 when successfully created", async () => {
    const userInput = { username: "fred", password: "password123" };
    const res = await request(server)
      .post("/api/auth/register")
      .send(userInput);

    expect(res.status).toBe(201);
  });

  it("should successfully register a new user", async () => {
    const userInput = { username: "fred", password: "password123" };

    await request(server)
      .post("/api/auth/register")
      .send(userInput);

    const users = await db.select("*").from("users");

    expect(users.length).toBe(1);
    expect(users[0].username).toBe("fred");
    expect(users[0].password).not.toBe("password123");
  });

  it("should return a token upon successfully", async () => {
    const userInput = { username: "fred", password: "password123" };

    const res = await request(server)
      .post("/api/auth/register")
      .send(userInput);

    const { token } = res.body;
    expect(token).not.toBe(undefined);
  });
});

describe("POST /api/auth/login", () => {
  const ROUTE = "/api/auth/login";

  beforeEach(async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "user1", password: "password123" });
  });

  it("should return 200 when user successfully logs in", async () => {
    const userInput = { username: "user1", password: "password123" };

    const res = await request(server)
      .post(ROUTE)
      .send(userInput);

    expect(res.status).toBe(200);
  });

  it("should return a token with the user's id when a user successfully logs in", async () => {
    const userInput = { username: "user1", password: "password123" };

    const res = await request(server)
      .post(ROUTE)
      .send(userInput);

    const decoded = jwt.decode(res.body.token);

    expect(decoded.sub).toBe(1);
  });

  it("should send a 401 when the user provides incorrect credentials", async () => {
    const userInput = { username: "user1", password: "badpassword" };

    const res = await request(server)
      .post(ROUTE)
      .send(userInput);

    expect(res.status).toBe(401);
  });

  it("should send a 400 when the user passes incomplete input", async () => {
    const missingPassword = { username: "george" };
    const missingUsername = { password: "fred" };
    const missingBoth = {};

    const firstRes = await request(server)
      .post("/api/auth/login")
      .send(missingPassword);

    const secondRes = await request(server)
      .post("/api/auth/login")
      .send(missingUsername);

    const thirdRes = await request(server)
      .post("/api/auth/login")
      .send(missingBoth);

    expect(firstRes.status).toBe(400);
    expect(secondRes.status).toBe(400);
    expect(thirdRes.status).toBe(400);
  });
});
