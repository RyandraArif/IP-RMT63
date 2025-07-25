const { User, Anime } = require("../models");
const { generateGeminiContent } = require("../helpers/gemini");

async function getRecommendations(req, res, next) {
  try {
    // if (!req.user) req.user = { id: 1 };
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user || !user.genre) {
      return res
        .status(400)
        .json({ message: "Set your favorite genres first" });
    }

    const preferences = user.genre.split(",").map((g) => g.trim());

    const animeList = await Anime.findAll();

    const prompt = `
Recommend top 5 anime based on user preferences.
The user enjoys anime with genres: ${preferences.join(", ")}.

You can only pick from the following animes:
${animeList.map((anime) => `- ${anime.id}:${anime.title}`).join("\n")}

Respond only with an array of anime IDs like: [1, 2, 3, 4, 5]
    `;

    console.log("Generating recommendations with prompt:\n", prompt);
    const recommendations = await generateGeminiContent(prompt);
    const recommendationsArray = JSON.parse(recommendations);
    console.log("Recommendations:", recommendationsArray);

    const recommendedAnimes = await Anime.findAll({
      where: { id: recommendationsArray },
    });

    res.json(recommendedAnimes);
  } catch (err) {
    next(err);
  }
}

module.exports = { getRecommendations };
