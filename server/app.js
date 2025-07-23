require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const AnimeController = require("./controllers/animeController");
const UserController = require("./controllers/userController");
const FavoriteController = require("./controllers/favoriteController");
const authentication = require("./middlewares/authentication");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.post("/register", UserController.register);
app.post("/login", UserController.login);
app.post("/login/google", UserController.googleLogin);

app.use(authentication);
app.patch("/users/genre", UserController.updateGenre);

app.get("/animes", AnimeController.getAnime);
app.get("/animes/recommendations", AnimeController.getRecommendation);
app.get("/animes/:id", AnimeController.getAnimeById);

app.post("/favorites", FavoriteController.addFavorite);
app.get("/favorites", FavoriteController.getUserFavorites);
app.delete("/favorites/:id", FavoriteController.deleteFavorite);

module.exports = app;
