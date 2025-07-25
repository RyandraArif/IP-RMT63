require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const AnimeController = require("./controllers/animeController");
const UserController = require("./controllers/userController");
const FavoriteController = require("./controllers/favoriteController");
const { getRecommendations } = require("./controllers/geminiController");
const authentication = require("./middlewares/authentication");
const errorHandler = require("./middlewares/errorHandler");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.post("/register", UserController.register);
app.post("/login", UserController.login);
app.post("/login/google", UserController.googleLogin);

app.use(authentication);
app.put("/users/genres", UserController.updateGenre);
app.get("/profiles", UserController.getProfile);
app.get("/recommendations", getRecommendations);

app.get("/animes", AnimeController.getAnime);
app.get("/animes/recommendations", AnimeController.getRecommendation);
app.get("/animes/:id", AnimeController.getAnimeById);

app.post("/favorites", FavoriteController.addFavorite);
app.get("/favorites", FavoriteController.getUserFavorites);
app.delete("/favorites/:id", FavoriteController.deleteFavorite);

app.use(errorHandler);

module.exports = app;
