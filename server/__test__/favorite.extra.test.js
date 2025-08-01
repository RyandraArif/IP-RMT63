const request = require("supertest");
const app = require("../app");
const { sequelize, User, Anime } = require("../models");
const { queryInterface } = sequelize;
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
let access_token;
let animeId;
let favoriteId;

beforeAll(async () => {
  await queryInterface.bulkInsert("Users", [
    {
      name: "tester",
      email: "tester@example.com",
      password: hashPassword("123456"),
      genre: "action,adventure",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const user = await User.findOne({ where: { email: "tester@example.com" } });
  access_token = signToken({ id: user.id });

  await queryInterface.bulkInsert("Animes", [
    {
      mal_id: 999,

      title: "Test Anime",
      image_url: "https://example.com/test.jpg",
      genre: "action,adventure",
      synopsis: "Test synopsis",
      mean_rating: 8.5,
      num_episodes: 12,
      media_type: "TV",
      start_date: new Date(),
      end_date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const anime = await Anime.findOne({ where: { title: "Test Anime" } });
  animeId = anime.id;

  const [favorite] = await queryInterface.bulkInsert(
    "Favorites",
    [
      {
        userId: user.id,
        animeId: anime.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    { returning: true }
  );

  const fav = await sequelize.models.Favorite.findOne({
    where: { userId: user.id, animeId: anime.id },
  });
  favoriteId = fav.id;
});

afterAll(async () => {
  await queryInterface.bulkDelete("Favorites", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
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

test("Get user favorites include Anime", async () => {
  const response = await request(app)
    .get("/favorites")
    .set("Authorization", `Bearer ${access_token}`);
  expect(response.status).toBe(200);
  expect(response.body[0].Anime).toBeDefined();
});

test("Delete favorite success", async () => {
  const response = await request(app)
    .delete(`/favorites/${favoriteId}`)
    .set("Authorization", `Bearer ${access_token}`);
  expect(response.status).toBe(200);
  expect(response.body.message).toBe("Favorite removed");
});

test("Delete favorite not found", async () => {
  const response = await request(app)
    .delete(`/favorites/99999`)
    .set("Authorization", `Bearer ${access_token}`);
  expect(response.status).toBe(404);
  expect(response.body.message).toBe("Favorite not found");
});
