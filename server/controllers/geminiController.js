const { User, Anime } = require("../models");
const { generateGeminiContent } = require("../helpers/gemini");

async function getRecommendations(req, res, next) {
  try {
    const userId = req.user.id;
    const { customPrompt } = req.query;

    const user = await User.findByPk(userId);
    if (!user || !user.genre) {
      return res
        .status(400)
        .json({ message: "Set your favorite genres first" });
    }

    const preferences = user.genre.split(",").map((g) => g.trim());
    const animeList = await Anime.findAll();

    const basePrompt = `
Recommend top 5 anime based on user preferences.
The user enjoys anime with genres: ${preferences.join(", ")}.

You can only pick from the following animes:
${animeList.map((anime) => `- ${anime.id}:${anime.title}`).join("\n")}

Additional instructions: ${customPrompt || "none"}

Respond only with an array of anime IDs like: [1, 2, 3, 4, 5]
    `;

    console.log("Generated prompt:\n", basePrompt);
    const recommendations = await generateGeminiContent(basePrompt);

    // Validasi response
    let recommendationsArray;
    try {
      recommendationsArray = JSON.parse(recommendations);
      if (!Array.isArray(recommendationsArray)) {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Failed to parse recommendations:", err);
      return res.status(500).json({ message: "AI response format error" });
    }

    const recommendedAnimes = await Anime.findAll({
      where: { id: recommendationsArray },
    });

    res.json({
      data: recommendedAnimes,
      meta: { prompt: basePrompt, rawResponse: recommendations },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getRecommendations };
