const { Favorite, Anime, User } = require("../models");

module.exports = class FavoriteController {
  static async addFavorite(req, res, next) {
    try {
      const { animeId } = req.body;
      const userId = req.user.id;

      const anime = await Anime.findByPk(animeId);
      if (!anime) {
        throw { name: "NotFound", message: "Anime not found" };
      }

      const existFavorite = await Favorite.findOne({
        where: {
          userId,
          animeId,
        },
      });

      if (existFavorite) {
        throw { name: "AlreadyExists", message: "Anime already in favorites" };
      }

      const favorite = await Favorite.create({ userId, animeId });
      res.status(201).json({
        message: "Anime add to favorites",
        favorite,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getUserFavorites(req, res, next) {
    try {
      const userId = req.user.id;
      const favorites = await Favorite.findAll({
        where: { userId },
        include: [Anime],
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });
      res.status(200).json(favorites);
    } catch (err) {
      next(err);
    }
  }

  static async deleteFavorite(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const favorite = await Favorite.findOne({
        where: { id, userId },
      });

      if (!favorite) {
        throw { name: "Not Found", message: "Favorite not found" };
      }

      await favorite.destroy();
      res.status(200).json({ message: "Favorite removed" });
    } catch (err) {
      next(err);
    }
  }
};
