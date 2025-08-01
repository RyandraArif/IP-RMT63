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

describe("GET /recommendations", () => {
  test("Berhasil mendapatkan rekomendasi AI (200)", async () => {
    const response = await request(app)
      .get("/recommendations?customPrompt=action")
      .set("Authorization", `Bearer ${access_token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("Gagal tanpa token (401)", async () => {
    const response = await request(app).get(
      "/recommendations?customPrompt=action"
    );
    expect(response.status).toBe(401);
  });

  test("Gagal jika genre user kosong (400)", async () => {
    const user = await User.create({
      name: "noGenre",
      email: "noGenre@example.com",
      password: hashPassword("123456"),
      genre: "Unknown",
    });
    await User.update(
      { genre: "" },
      { where: { id: user.id }, validate: false }
    );
    const token = signToken({ id: user.id });
    const response = await request(app)
      .get("/recommendations?customPrompt=action")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(400);
  });
});
