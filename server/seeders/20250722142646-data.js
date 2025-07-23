require("dotenv").config();
const axios = require("axios");

("use strict");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const clientId = process.env.MAL_CLIENT_ID;
    console.log("--------->", clientId);

    const genreToString = (genres) =>
      genres.map((genre) => genre.name).join(", ");

    const headers = {
      "X-MAL-CLIENT-ID": clientId,
    };

    const animeList = [];

    try {
      const response = await axios.get(
        "https://api.myanimelist.net/v2/anime/ranking?ranking_type=all&limit=20&fields=id,title,synopsis,mean,num_episodes,start_date,end_date,media_type,genres,main_picture",
        {
          headers,
        }
      );

      for (const anime of response.data.data) {
        const animes = anime.node;
        animeList.push({
          mal_id: animes.id,
          title: animes.title,
          image_url:
            animes.main_picture?.large || animes.main_picture?.medium || null,
          synopsis: animes.synopsis,
          mean_rating: animes.mean,
          num_episodes: animes.num_episodes,
          start_date: animes.start_date,
          end_date: animes.end_date,
          media_type: animes.media_type,
          genre: genreToString(animes.genres),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      await queryInterface.bulkInsert("Animes", animeList);
    } catch (err) {
      console.log("------------------>", err);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Animes", null, {});
  },
};
