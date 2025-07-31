import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const RecommendationForm = ({ onRecommendationsGenerated }) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      Swal.fire("Error", "Please enter your recommendation criteria", "error");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.get(`${BASE_URL}/animes/recommendations`, {
        params: { customPrompt: prompt },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      onRecommendationsGenerated(res.data.data);

      Swal.fire({
        title: "Success!",
        html: `Generated 5 recommendations based on:<br/><em>"${prompt}"</em>`,
        icon: "success",
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to generate",
        "error"
      );
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
              placeholder="Example: 'Dark psychological thrillers with plot twists' or 'Lighthearted slice-of-life with comedy'"
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

        <div className="mt-3">
          <h6>Prompt Examples:</h6>
          <ul className="list-unstyled">
            <li>
              <button
                className="btn btn-sm btn-outline-secondary me-2 mb-2"
                onClick={() => setPrompt("Underrated hidden gems from 2010s")}
              >
                Underrated gems
              </button>
            </li>
            <li>
              <button
                className="btn btn-sm btn-outline-secondary me-2 mb-2"
                onClick={() =>
                  setPrompt("Best anime for beginners who like action")
                }
              >
                For beginners
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecommendationForm;
