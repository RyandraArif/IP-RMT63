import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router";

export default function RegisterPage() {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [genre, setGenre] = useState();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(name, email, password, genre);

    try {
      await axios.post("http://localhost:3000/register", {
        name,
        email,
        password,
        genre,
      });

      navigate("/login");
    } catch (err) {
      console.log("-------------->", err.response.data.message);
    }
  };

  return (
    <div className="container-sm py-5 d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-lg p-4 w-100" style={{ maxWidth: "500px" }}>
        <h3 className="text-center mb-4 text-primary fw-bold">
          Register to Anime List
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Email address</label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Favorite Genres</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. action, fantasy, isekai"
              name="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              required
            />
            <div className="form-text">Separate with , if multiple genres</div>
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-semibold">
            Register
          </button>

          <p className="text-center mt-3 mb-0">
            Do you have an account?
            <Link to="/login" className="text-decoration-none">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
