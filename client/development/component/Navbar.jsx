import { Link, useNavigate } from "react-router";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid">
        {/* LEFT NAV */}
        <div className="navbar-brand d-flex gap-3">
          <Link to="/" className="nav-link text-white">
            Home
          </Link>
          <Link to="/profiles" className="nav-link text-white">
            Profile
          </Link>
          <Link to="/favorites" className="nav-link text-white">
            Favorites
          </Link>
        </div>

        {/* RIGHT NAV */}
        <div className="d-flex ms-auto">
          <button className="btn btn-outline-light" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
