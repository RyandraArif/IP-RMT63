import { useEffect, useState } from "react";
import axios from "axios";
import AnimeCard from "../component/AnimeCard";

const BASE_URL = "https://api.ryandraarif.com";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);

  const fetchFavorites = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/favorites`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setFavorites(res.data || []);
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };

  const handleFavoriteToggle = async (animeId) => {
    const favToRemove = favorites.find(
      (fav) => fav.AnimeId === animeId || fav.animeId === animeId
    );
    if (!favToRemove) {
      return;
    }

    await axios.delete(`${BASE_URL}/favorites/${favToRemove.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    setFavorites((prev) => prev.filter((fav) => fav.id !== favToRemove.id));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">My Favorites</h2>
      <div className="d-flex flex-wrap gap-3 justify-content-center">
        {favorites.map((fav) => (
          <AnimeCard
            key={fav.id}
            anime={fav.Anime}
            isFavorite={true}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}
      </div>
    </div>
  );
}
