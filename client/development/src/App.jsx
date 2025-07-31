import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import RegisterPage from "../pages/Register";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import AnimeDetail from "../pages/DetailPage";
import FavoritesPage from "../pages/FavoritePage";
import Navbar from "../component/Navbar";
import ProfilePage from "../pages/Profile";
import RecommendationPage from "../component/RecommendationPage";

function Layout() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profiles" element={<ProfilePage />} />
          <Route path="/animes/:id" element={<AnimeDetail />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/ai-recommend" element={<RecommendationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
