import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://api.ryandraarif.com";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [genreInput, setGenreInput] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/profiles`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setProfile(res.data.data);
      setGenreInput(res.data.data.genre || "");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateGenre = async (e) => {
    e.preventDefault();
    if (!genreInput.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please input at least one genre!",
      });
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        `${BASE_URL}/users/genres`,
        { genre: genreInput },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      await Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Your genres have been updated",
        showConfirmButton: false,
        timer: 1500,
      });

      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">User Profile</h2>
      <div className="card mx-auto" style={{ maxWidth: "500px" }}>
        <div className="card-body">
          <h4 className="card-title">{profile.username}</h4>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>

          <form onSubmit={handleUpdateGenre}>
            <label htmlFor="genre" className="form-label">
              <strong>Genre:</strong>
            </label>
            <input
              id="genre"
              type="text"
              className="form-control mb-3"
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              placeholder="e.g. Action, Comedy, Romance"
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Genre"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
