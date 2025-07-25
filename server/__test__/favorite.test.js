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
const { sequelize, User, Anime, Favorite } = require("../models");
const { queryInterface } = sequelize;
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

let access_token;
let existAnimeId;
let favoriteId;

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
  await queryInterface.bulkDelete("Favorites", null, {
    restartIdentity: true,
    truncate: true,
    cascade: true,
  });
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

describe("POST /favorites", () => {
  test("Berhasil menambahkan favorite (201)", async () => {
    const response = await request(app)
      .post("/favorites")
      .set("Authorization", `Bearer ${access_token}`)
      .send({ animeId: existAnimeId });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Anime add to favorites");
    favoriteId = response.body.favorite.id;
  });

  test("Gagal ketika anime sudah difavoritkan (400)", async () => {
    const response = await request(app)
      .post("/favorites")
      .set("Authorization", `Bearer ${access_token}`)
      .send({ animeId: existAnimeId });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Anime already in favorites");
  });
});

describe("GET /favorites", () => {
  test("Berhasil mendapatkan daftar favorite (200)", async () => {
    const response = await request(app)
      .get("/favorites")
      .set("Authorization", `Bearer ${access_token}`);

    expect(response.status).toBe(200);
    expect(response.body[0]).toHaveProperty("Anime");
  });
});

describe("DELETE /favorites/:id", () => {
  test("Berhasil menghapus favorite (200)", async () => {
    const response = await request(app)
      .delete(`/favorites/${favoriteId}`)
      .set("Authorization", `Bearer ${access_token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Favorite removed");
  });

  test("Gagal ketika favorite tidak ditemukan (404)", async () => {
    const response = await request(app)
      .delete("/favorites/999")
      .set("Authorization", `Bearer ${access_token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Data not found");
  });
});
