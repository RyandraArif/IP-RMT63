const { Anime } = require("../models");
const { Op } = require("sequelize");
const qs = require("qs");

module.exports = class AnimeController {
  static async getAnime(req, res, next) {
    try {
      const { filter, sort, page, search } = qs.parse(req.query);

      let queryOptions = {
        where: {},
        limit: 10,
        offset: 0,
      };

      if (search) {
        queryOptions.where.title = { [Op.iLike]: `%${search}%` };
      }

      if (filter?.genres) {
        const genres = filter.genres.split(",").map((g) => g.trim());
        queryOptions.where[Op.or] = genres.map((genre) => ({
          genre: {
            [Op.iLike]: `%${genre}%`,
          },
        }));
      }

      if (sort) {
        queryOptions.order = [[sort.by || "mean_rating", sort.order || "DESC"]];
      }

      if (page?.size) queryOptions.limit = Number(page.size);

      if (page?.number) {
        queryOptions.offset = (Number(page.number) - 1) * queryOptions.limit;
      }

      const { count, rows: animes } = await Anime.findAndCountAll(queryOptions);

      res.status(200).json({
        data: animes,
        pagination: {
          currentPage: Number(page?.number || 1),
          dataPerPage: queryOptions.limit,
          totalData: count,
          totalPages: Math.ceil(count / queryOptions.limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAnimeById(req, res, next) {
    try {
      const animeId = +req.params.id;
      const animes = await Anime.findByPk(animeId);

      if (!animes) {
        // res.status(404).json({ message: `Data not found` })
        // return
        throw { name: "Not Found", message: `Data not found` };
      }
      res.status(200).json(animes);
    } catch (err) {
      // console.log(err, "<-------");
      // res.status(404).json({ message: 'Data Not Found'})
      next(err);
    }
  }

  static async getRecommendation(req, res, next) {
    try {
      const user = req.user;

      if (!user.genre) {
        throw {
          name: "BadRequest",
          message: "Set your favorite genres first",
        };
      }

      const userGenres = user.genre.split(",").map((g) => g.trim());

      const recommendations = await Anime.findAll({
        where: {
          [Op.or]: userGenres.map((genre) => ({
            genre: {
              [Op.iLike]: `%${genre}%`,
            },
          })),
        },
        limit: 10,
      });

      res.json(recommendations);
    } catch (err) {
      next(err);
    }
  }
};
