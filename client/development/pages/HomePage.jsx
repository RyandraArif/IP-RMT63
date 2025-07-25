import { useEffect, useState } from "react";
import axios from "axios";
import AnimeCard from "../component/AnimeCard";

const BASE_URL = "https://api.ryandraarif.com";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("DESC");
  const [page, setPage] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [animes, setAnimes] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 200,
    totalPages: 20,
  });

  // Favorite state
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);

  // FETCH PROFILE
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/profiles`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const profileData = res.data.data;

      const genreString = profileData.genre || "";
      const genreArray = genreString
        ? genreString.split(",").map((g) => g.trim())
        : [];

      setGenres(genreArray);

      if (genreArray.length > 0) {
        setSelectedGenre(genreArray[0]);
      }
    } catch (err) {
      console.error("fetchProfile error:", err);
    }
  };

  // FETCH ANIMES
  const fetchAnimes = async () => {
    try {
      const url = new URL(`${BASE_URL}/animes`);
      if (search) url.searchParams.append("search", search);
      if (selectedGenre)
        url.searchParams.append("filter[genres]", selectedGenre);
      url.searchParams.append("sort[by]", "mean_rating");
      url.searchParams.append("sort[order]", sort);
      url.searchParams.append("page[number]", page.toString());
      url.searchParams.append("page[size]", "10");

      const res = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      const data = res.data.data || [];
      const pagination = res.data.pagination || {
        currentPage: 1,
        dataPerPage: 10,
        totalData: 0,
        totalPages: 1,
      };

      setAnimes(data);
      setMeta({
        page: pagination.currentPage,
        limit: pagination.dataPerPage,
        total: pagination.totalData,
        totalPages: pagination.totalPages,
      });
    } catch (err) {
      console.error("fetchAnimes error:", err);
      setAnimes([]);
      setMeta({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      });
    }
  };

  // FETCH FAVORITES
  const fetchFavorites = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/favorites`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setFavorites(res.data || []);
      setFavoriteIds(res.data.map((fav) => fav.AnimeId || fav.animeId));
    } catch (err) {
      console.error("fetchFavorites error:", err);
    }
  };

  // HANDLE FAVORITE TOGGLE
  const handleFavoriteToggle = async (animeId) => {
    try {
      if (favoriteIds.includes(animeId)) {
        // Remove favorite
        const favToRemove = favorites.find(
          (fav) => (fav.AnimeId || fav.animeId) === animeId
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
        setFavoriteIds((prev) => prev.filter((id) => id !== animeId));
      } else {
        // Add favorite
        const res = await axios.post(
          `${BASE_URL}/favorites`,
          { animeId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        fetchFavorites();
      }
    } catch (err) {
      console.error("------------>", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchFavorites();
  }, []);

  useEffect(() => {
    fetchAnimes();
  }, [search, sort, page, selectedGenre]);

  return (
    <div className="container-xxl py-5">
      <h1 className="text-center mb-4">Anime List</h1>

      {/* FILTER */}
      <div className="w-100 w-lg-50 m-auto py-3">
        <div className="row g-2">
          <div className="col-4">
            <select
              className="form-select"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
          <div className="col-4">
            <input
              className="form-control"
              type="search"
              placeholder="Search anime"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-4">
            <select
              className="form-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="DESC">Highest Rating</option>
              <option value="ASC">Lowest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* ANIME LIST */}
      <div className="d-flex gap-3 flex-wrap justify-content-center">
        {animes.map((anime) => (
          <AnimeCard
            key={anime.id}
            anime={anime}
            isFavorite={favoriteIds.includes(anime.id)}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}
      </div>

      {/* PAGINATION */}
      <nav
        aria-label="Page navigation"
        className="py-3 m-auto d-flex justify-content-center"
      >
        <ul className="pagination">
          {Array.from({ length: meta.totalPages })
            .filter((_, i) => i < 20)
            .map((_, i) => (
              <li
                key={i}
                className={`page-item ${i + 1 === page ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
        </ul>
      </nav>
    </div>
  );
}
