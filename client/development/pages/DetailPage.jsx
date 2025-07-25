import { useEffect, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";

const BASE_URL = "https://api.ryandraarif.com";

export default function AnimeDetail() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/animes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => setAnime(res.data))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load anime detail");
      });
  }, [id]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!anime) return <div className="text-center">Loading...</div>;

  return (
    <div className="container py-5">
      <div className="row justify-content-center align-items-start">
        <div className="col-md-5 mb-4">
          <img
            src={anime.image_url}
            alt={anime.title}
            className="img-fluid rounded shadow"
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        </div>
        <div className="col-md-7">
          <h2 className="mb-3">{anime.title}</h2>
          <p className="text-muted">{anime.synopsis}</p>
          <p>
            <strong>Genre:</strong> {anime.genre}
          </p>
          <p>
            <strong>Rating:</strong> ⭐ {anime.mean_rating}
          </p>
        </div>
      </div>
    </div>
  );
}
