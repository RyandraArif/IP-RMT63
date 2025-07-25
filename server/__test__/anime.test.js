require("dotenv").config();
const request = require("supertest");
const {
  test,
  expect,
  describe,
  beforeAll,
  afterAll,
} = require("@jest/globals");
const app = require("../app");
const { sequelize, Anime, User } = require("../models");
const { queryInterface } = sequelize;
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

let access_token;
let existAnimeId;

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

  await queryInterface.bulkInsert("Animes", [
    {
      mal_id: 1,
      title: "Naruto",
      image_url: "https://example.com/naruto.jpg",
      genre: "action,adventure",
      synopsis: "Anime tentang ninja",
      mean_rating: 8.5,
      num_episodes: 220,
      media_type: "TV",
      start_date: new Date(),
      end_date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const user = await User.findOne({ where: { email: "danang@example.com" } });
  access_token = signToken({ id: user.id });

  const anime = await Anime.findOne({ where: { title: "Naruto" } });
  existAnimeId = anime.id;
});

afterAll(async () => {
  await queryInterface.bulkDelete("Users", null, {
    restartIdentity: true,
    truncate: true,
    cascade: true,
  });
  await queryInterface.bulkDelete("Animes", null, {
    restartIdentity: true,
    truncate: true,
    cascade: true,
  });
});

describe("GET /animes", () => {
  test("Berhasil mendapatkan semua anime (200)", async () => {
    const response = await request(app)
      .get("/animes")
      .set("Authorization", `Bearer ${access_token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data", expect.any(Array));
  });

  test("Berhasil filter anime by genre (200)", async () => {
    const response = await request(app)
      .get("/animes?filter[genres]=action")
      .set("Authorization", `Bearer ${access_token}`);

    expect(response.status).toBe(200);
    expect(response.body.data[0].genre).toContain("action");
  });
});

describe("GET /animes/:id", () => {
  test("Berhasil mendapatkan anime by ID (200)", async () => {
    const response = await request(app)
      .get(`/animes/${existAnimeId}`)
      .set("Authorization", `Bearer ${access_token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", existAnimeId);
  });

  test("Gagal ketika ID tidak ditemukan (404)", async () => {
    const response = await request(app)
      .get("/animes/999")
      .set("Authorization", `Bearer ${access_token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Data not found");
  });
});

describe("GET /animes/recommendations", () => {
  test("Berhasil mendapatkan rekomendasi (200)", async () => {
    const response = await request(app)
      .get("/animes/recommendations")
      .set("Authorization", `Bearer ${access_token}`);

    expect(response.status).toBe(200);
    expect(response.body[0].genre).toContain("action");
  });

  test("Gagal ketika user belum set genre (400)", async () => {
    const newUser = await User.create({
      name: "User Baru",
      email: "new@example.com",
      password: hashPassword("123456"),
      profilePict: "https://example.com/new.jpg",
      genre: "action",
    });
    const newToken = signToken({ id: newUser.id });

    await User.update(
      { genre: "" },
      { where: { id: newUser.id }, validate: false }
    );

    const response = await request(app)
      .get("/animes/recommendations")
      .set("Authorization", `Bearer ${newToken}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Set your favorite genres first");
  });
});
