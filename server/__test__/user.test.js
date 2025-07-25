const request = require("supertest");
const {
  test,
  expect,
  describe,
  beforeAll,
  afterAll,
} = require("@jest/globals");
const app = require("../app");
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { sequelize, User } = require("../models");
const { queryInterface } = sequelize;

let access_token;

beforeAll(async () => {
  await queryInterface.bulkInsert("Users", [
    {
      name: "danang",
      email: "danang@example.com",
      password: hashPassword("123456"),
      profilePict: "https://example.com/danang.jpg",
      genre: "action,adventure",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const user = await User.findOne({ where: { email: "danang@example.com" } });
  access_token = signToken({ id: user.id });
});

afterAll(async () => {
  await queryInterface.bulkDelete("Users", null, {
    restartIdentity: true,
    truncate: true,
    cascade: true,
  });
});

describe("POST /register", () => {
  test("Berhasil register dengan status 201", async () => {
    const response = await request(app).post("/register").send({
      name: "New User",
      email: "new@example.com",
      password: "123456",
      genre: "comedy",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id", expect.any(Number));
  });

  test("Gagal register ketika email duplicate (400)", async () => {
    const response = await request(app).post("/register").send({
      name: "danang",
      email: "danang@example.com",
      password: "123456",
      genre: "action",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Email must be unique");
  });
});

describe("POST /login", () => {
  test("Berhasil login dan mengirimkan access token (200)", async () => {
    const response = await request(app).post("/login").send({
      email: "danang@example.com",
      password: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("access_token", expect.any(String));
  });

  test("Gagal login ketika password salah (401)", async () => {
    const response = await request(app).post("/login").send({
      email: "danang@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });
});

describe("PATCH /users/genre", () => {
  test("Berhasil update genre (200)", async () => {
    const response = await request(app)
      .patch("/users/genre")
      .set("Authorization", `Bearer ${access_token}`)
      .send({ genre: "fantasy,sci-fi" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Genre updated");
  });

  test("Gagal update ketika genre kosong (400)", async () => {
    const response = await request(app)
      .patch("/users/genre")
      .set("Authorization", `Bearer ${access_token}`)
      .send({ genre: "" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Genre is required");
  });
});
