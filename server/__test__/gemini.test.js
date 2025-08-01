test("Fallback ke rekomendasi populer jika Gemini kosong", async () => {
  const request = require("supertest");
  jest.resetModules();
  const gemini = require("../helpers/gemini");
  jest.spyOn(gemini, "generateGeminiContent").mockResolvedValueOnce("[]");
  const app = require("../app");
  const response = await request(app)
    .get("/recommendations")
    .set("Authorization", `Bearer ${global.access_token}`);
  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
  jest.restoreAllMocks();
});

test("Error jika fallback rekomendasi juga kosong", async () => {
  const request = require("supertest");
  jest.resetModules();
  const gemini = require("../helpers/gemini");
  jest.spyOn(gemini, "generateGeminiContent").mockResolvedValueOnce("[]");

  const models = require("../models");
  jest.spyOn(models.Anime, "findAll").mockResolvedValue([]);
  const app = require("../app");
  const response = await request(app)
    .get("/recommendations")
    .set("Authorization", `Bearer ${global.access_token}`);
  expect(response.status).toBe(400);
  expect(response.body.error).toBe("No anime matched your request.");
  jest.restoreAllMocks();
});
const { sequelize, User, Anime } = require("../models");
const { queryInterface } = sequelize;

beforeAll(async () => {
  await queryInterface.bulkInsert("Users", [
    {
      name: "tester",
      email: "tester@example.com",
      password: "$2b$10$testpasswordhash",
      genre: "action,romance",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  await queryInterface.bulkInsert("Animes", [
    {
      title: "Attack on Titan",
      genre: "action,drama",
      mean_rating: 9.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Kaguya-sama",
      genre: "romance,comedy",
      mean_rating: 8.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const user = await User.findOne({ where: { email: "tester@example.com" } });
  global.access_token = require("../helpers/jwt").signToken({ id: user.id });
});

afterAll(async () => {
  await queryInterface.bulkDelete("Animes", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
});

describe("GET /recommendations", () => {
  const request = require("supertest");
  const app = require("../app");

  test("Berhasil dapat rekomendasi (200)", async () => {
    const response = await request(app)
      .get("/recommendations")
      .set("Authorization", `Bearer ${global.access_token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("Gagal tanpa genre user (400)", async () => {
    const { queryInterface } = require("../models").sequelize;
    await queryInterface.bulkInsert("Users", [
      {
        name: "nogenre",
        email: "nogenre@example.com",
        password: "$2b$10$testpasswordhash",
        genre: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const user = await require("../models").User.findOne({
      where: { email: "nogenre@example.com" },
    });
    const token = require("../helpers/jwt").signToken({ id: user.id });
    const response = await request(app)
      .get("/recommendations")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Genre is required");
    await queryInterface.bulkDelete("Users", { email: "nogenre@example.com" });
  });

  test("Gagal parse response Gemini (400)", async () => {
    jest.resetModules();
    const gemini = require("../helpers/gemini");
    jest
      .spyOn(gemini, "generateGeminiContent")
      .mockResolvedValueOnce("not a json");
    const app = require("../app");
    const response = await request(app)
      .get("/recommendations")
      .set("Authorization", `Bearer ${global.access_token}`);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Failed to parse Gemini response");
    jest.restoreAllMocks();
  });
});
