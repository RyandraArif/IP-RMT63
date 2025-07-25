import { Link } from "react-router";

export default function AnimeCard({ anime, onFavoriteToggle, isFavorite }) {
  return (
    <div className="card" style={{ width: "18rem" }}>
      <img
        src={anime.image_url}
        className="card-img-top"
        alt={anime.title}
        style={{ height: 250, objectFit: "cover" }}
      />
      <div className="card-body d-flex flex-column justify-content-between">
        <h5 className="card-title">{anime.title}</h5>
        <p className="card-text mb-1">
          <strong>Genre:</strong> {anime.genre}
        </p>
        <p className="card-text mb-1">
          <strong>Rating:</strong> {anime.mean_rating}
        </p>
        <div className="d-flex gap-2 mt-2">
          <button
            onClick={() => onFavoriteToggle(anime.id)}
            className={`btn ${isFavorite ? "btn-danger" : "btn-primary"}`}
          >
            {isFavorite ? "Remove Favorite" : "Add Favorite"}
          </button>
          <Link
            to={`/animes/${anime.id}`}
            className="btn btn-outline-secondary"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
