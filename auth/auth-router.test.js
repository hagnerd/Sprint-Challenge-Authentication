const request = require("supertest");
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
