const { Anime } = require("../models");
const { generateGeminiContent } = require("../helpers/gemini");

async function getRecommendations(req, res, next) {
  try {
    const { customPrompt } = req.query;

    const animeList = await Anime.findAll();

    const flexiblePrompt = `
You are an anime recommendation expert.

Given the user's request: "${customPrompt}", select up to 5 anime from the list below that are most relevant to the user's input. You may consider title, genre, or any related keywords. If the request is vague or broad, pick the most popular or generally appealing anime from the list.

ONLY use the anime from this list:
${animeList
  .map((anime) => `- ${anime.id}: ${anime.title} (Genres: ${anime.genre})`)
  .join("\n")}

IMPORTANT:
- Return only a JSON array of anime IDs. Example: [1, 5, 10, 12, 14]
- Do NOT explain or add any extra text.
- Do NOT invent anime not in the list.
`;

    console.log("Generated Prompt:\n", flexiblePrompt);

    const rawResponse = await generateGeminiContent(flexiblePrompt);
    console.log("Raw Gemini Response:", rawResponse);

    let animeIds;
    try {
      animeIds = JSON.parse(rawResponse);
      if (!Array.isArray(animeIds)) throw new Error("Invalid format");
    } catch (err) {
      return res.status(400).json({
        error: "Failed to parse Gemini response",
        rawOutput: rawResponse,
      });
    }

    let recommendedAnime = await Anime.findAll({
      where: { id: animeIds },
    });

    if (customPrompt) {
      const allAnime = await Anime.findAll();

      const keywordMap = {
        seru: ["action", "adventure", "thriller", "fantasy"],
        romantis: ["romance", "drama"],
        lucu: ["comedy", "slice of life"],
        menegangkan: ["thriller", "mystery", "action"],
        sedih: ["drama", "tragedy"],
        isekai: ["isekai", "fantasy"],
        sekolah: ["school", "slice of life"],
      };

      let keywords = customPrompt
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(" ")
        .filter(Boolean);

      let mappedKeywords = [];
      keywords.forEach((word) => {
        if (keywordMap[word]) {
          mappedKeywords.push(...keywordMap[word]);
        } else {
          mappedKeywords.push(word);
        }
      });

      const keywordFiltered = allAnime.filter((anime) => {
        const title = anime.title.toLowerCase();
        const genre = anime.genre?.toLowerCase() || "";
        return mappedKeywords.some(
          (word) => title.includes(word) || genre.includes(word)
        );
      });

      const combined = [...recommendedAnime, ...keywordFiltered];
      const uniqueMap = new Map();
      combined.forEach((anime) => {
        uniqueMap.set(anime.id, anime);
      });
      let uniqueList = Array.from(uniqueMap.values());

      recommendedAnime = uniqueList.sort((a, b) => {
        const aText = (a.title + " " + (a.genre || "")).toLowerCase();
        const bText = (b.title + " " + (b.genre || "")).toLowerCase();
        const aMatch = mappedKeywords.filter((word) =>
          aText.includes(word)
        ).length;
        const bMatch = mappedKeywords.filter((word) =>
          bText.includes(word)
        ).length;
        return bMatch - aMatch;
      });
    }

    if (!recommendedAnime || recommendedAnime.length === 0) {
      recommendedAnime = await Anime.findAll({
        order: [["mean_rating", "DESC"]],
        limit: 5,
      });

      if (!recommendedAnime || recommendedAnime.length === 0) {
        return res.status(400).json({
          error: "No anime matched your request.",
          suggestedPromptTips: [
            "Use clear keywords like 'magic', 'romance', 'school'",
            "Avoid vague terms. Be specific like 'anime with powerful swordsman'",
          ],
          rawOutput: rawResponse,
        });
      }
    }

    res.json(recommendedAnime.slice(0, 5));
  } catch (err) {
    console.error("Recommendation Error:", err);
    next(err);
  }
}

module.exports = {
  getRecommendations,
};
