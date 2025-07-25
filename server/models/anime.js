"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Anime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Anime.hasMany(models.Favorite, { foreignKey: "animeId" });
    }
  }
  Anime.init(
    {
      mal_id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Mal id is required",
          },
          notNull: {
            msg: "Mal id is required",
          },
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Title is required",
          },
          notNull: {
            msg: "Title is required",
          },
        },
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Image URL is required",
          },
          notNull: {
            msg: "Image URL is required",
          },
        },
      },
      genre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Genre is required",
          },
          notNull: {
            msg: "Genre is required",
          },
        },
      },
      synopsis: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Synopsis is required",
          },
          notNull: {
            msg: "Synopsis is required",
          },
        },
      },
      mean_rating: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Rating is required",
          },
          notNull: {
            msg: "Rating is required",
          },
        },
      },
      num_episodes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Number episode is required",
          },
          notNull: {
            msg: "Number episode is required",
          },
        },
      },
      media_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Media is required",
          },
          notNull: {
            msg: "Media is required",
          },
        },
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Start date is required",
          },
          notNull: {
            msg: "Start date is required",
          },
        },
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "End date is required",
          },
          notNull: {
            msg: "End date is required",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Anime",
    }
  );
  return Anime;
};
