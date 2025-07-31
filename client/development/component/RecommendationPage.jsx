import { useState } from "react";
import RecommendationForm from "../components/RecommendationForm";
import AnimeCard from "../components/AnimeCard";

const RecommendationPage = () => {
  const [recommendations, setRecommendations] = useState([]);

  return (
    <div className="container py-5">
      <h1 className="mb-4">AI Anime Recommender</h1>

      <RecommendationForm onRecommendationsGenerated={setRecommendations} />

      {recommendations.length > 0 && (
        <div className="mt-5">
          <h2 className="mb-4">Your Recommendations</h2>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {recommendations.map((anime) => (
              <div key={anime.id} className="col">
                <AnimeCard anime={anime} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationPage;
