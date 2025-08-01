const request = require("supertest");
const {
  test,
  expect,
  describe,
  beforeAll,
  afterAll,
} = require("@jest/globals");
const app = require("../app");
const { sequelize, User, Anime } = require("../models");
const { queryInterface } = sequelize;
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

let access_token;
let animeId;

beforeAll(async () => {
  await queryInterface.bulkInsert("Users", [
    {
      name: "tester2",
      email: "tester2@example.com",
      password: hashPassword("123456"),
      genre: "action,adventure",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const user = await User.findOne({ where: { email: "tester2@example.com" } });
  access_token = signToken({ id: user.id });

  await queryInterface.bulkInsert("Animes", [
    {
      mal_id: 1000,
      title: "Test Anime 2",
      image_url: "https://example.com/test2.jpg",
      genre: "action,adventure",
      synopsis: "Test synopsis 2",
      mean_rating: 9.0,
      num_episodes: 24,
      media_type: "TV",
      start_date: new Date(),
      end_date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const anime = await Anime.findOne({ where: { title: "Test Anime 2" } });
  animeId = anime.id;
});

afterAll(async () => {
  await queryInterface.bulkDelete("Animes", {});
  await queryInterface.bulkDelete("Users", {});
});

describe("AnimeController Extra Coverage", () => {
  test("Get anime with filter, sort, and pagination", async () => {
    const response = await request(app)
      .get(
        "/animes?filter[genres]=action&sort[by]=mean_rating&sort[order]=DESC&page[number]=1&page[size]=5"
      )
      .set("Authorization", `Bearer ${access_token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.pagination).toBeDefined();
  });

  test("Get anime by id found", async () => {
    const response = await request(app)
      .get(`/animes/${animeId}`)
      .set("Authorization", `Bearer ${access_token}`);
    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Test Anime 2");
  });

  test("Get anime by id not found", async () => {
    const response = await request(app)
      .get(`/animes/99999`)
      .set("Authorization", `Bearer ${access_token}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Data not found");
  });

  test("Get anime recommendations with user genre unset", async () => {
    // Insert user tanpa genre
    const { queryInterface } = require("../models").sequelize;
    await queryInterface.bulkInsert("Users", [
      {
        name: "nogenre2",
        email: "nogenre2@example.com",
        password: "$2b$10$testpasswordhash",
        genre: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const user = await require("../models").User.findOne({
      where: { email: "nogenre2@example.com" },
    });
    const token = require("../helpers/jwt").signToken({ id: user.id });
    const response = await request(app)
      .get("/animes/recommendations")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Set your favorite genres first");
    await queryInterface.bulkDelete("Users", { email: "nogenre2@example.com" });
  });

  test("Get recommendations for user with multiple genres", async () => {
    const response = await request(app)
      .get(`/animes/recommendations`)
      .set("Authorization", `Bearer ${access_token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
