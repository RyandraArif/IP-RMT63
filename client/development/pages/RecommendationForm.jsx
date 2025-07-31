import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:3000";

function removeNonAlphanumericAndSpaces(text) {
  return text
    .split("")
    .filter((char) => {
      const isLetter =
        (char >= "a" && char <= "z") || (char >= "A" && char <= "Z");
      const isDigit = char >= "0" && char <= "9";
      const isSpace = char === " ";
      return isLetter || isDigit || isSpace;
    })
    .join("");
}

function extractKeywords(prompt) {
  const lowercasePrompt = prompt.toLowerCase();
  const cleanedPrompt = removeNonAlphanumericAndSpaces(lowercasePrompt);
  const wordsArray = cleanedPrompt.split(" ");
  const keywords = wordsArray.filter((word) => word !== "");
  return keywords;
}

const RecommendationForm = ({ onRecommendationsGenerated }) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      Swal.fire({
        icon: "error",
        title: "Empty Prompt",
        text: "Please describe exactly what anime you want",
        footer: 'Example: "Only isekai anime with game mechanics"',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.get(`${BASE_URL}/recommendations`, {
        params: {
          customPrompt: `STRICTLY FOLLOW: ${prompt}. IGNORE USER'S USUAL PREFERENCES.`,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      onRecommendationsGenerated(data);

      Swal.fire("Success!", `Found ${data.length} recommendations.`, "success");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Not Perfect Match",
        html: `<p>Some results didn't match your request for <b>${prompt}</b></p>
            <p>Try being more specific like:</p>
            <ul>
              <li>"Only romance anime with adult characters"</li>
              <li>"Action anime with no comedy elements"</li>
            </ul>`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Custom AI Recommendations</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              What kind of anime are you looking for?
            </label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Example: 'Dark psychological thrillers with plot twists'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="form-text">
              Be specific! Mention genres, themes, or elements you want.
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Generate Recommendations"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecommendationForm;
