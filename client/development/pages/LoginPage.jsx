import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("https://api.ryandraarif.com/login", {
        email,
        password,
      });
      localStorage.setItem("access_token", data.access_token);
      console.log("Login success");
      navigate("/");
    } catch (err) {
      console.log(err.response.data.message);
    }
  };

  async function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    try {
      const { data } = await axios.post(
        "https://api.ryandraarif.com/login/google",
        {
          id_token: response.credential,
        }
      );
      const genre = data.genre;
      localStorage.setItem("genre", genre);
      localStorage.setItem("access_token", data.access_token);
      console.log("Login success");
      navigate("/");
    } catch (err) {
      console.log(err.response.data.message);
    }
  }

  useEffect(() => {
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(document.getElementById("buttonDiv"), {
      theme: "outline",
      size: "large",
    });
  }, []);

  return (
    <div className="container-sm py-5">
      <h3 className="text-center mb-4 text-primary fw-bold">
        Login to Anime List
      </h3>
      <div className="w-50 mx-auto border rounded p-4 shadow-sm bg-light">
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="emailInput"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="passwordInput" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="passwordInput"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3">
            Login
          </button>
        </form>

        <div className="text-center text-muted my-2">or</div>

        <div className="w-50 mx-auto d-flex justify-content-center">
          <div id="buttonDiv" style={{ width: "fit-content" }}></div>
        </div>
        <p className="text-center mt-3 mb-0">
          Dont have an account?
          <Link to="/register" className="text-decoration-none">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
