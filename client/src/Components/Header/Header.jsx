import lungslogo from "/src/assets/lungslogo.png";
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [imgError, setImgError] = useState(false);

  const fallback = user.name ? user.name.charAt(0).toUpperCase() : "?";
  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-4 md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-16 h-10 rounded-full overflow-hidden flex items-center justify-center">
            <img
              src={lungslogo}
              alt="BreatheSafeAI"
              className="w-32 h-16 object-cover"
            />
          </div>
          <span className="text-3xl font-semibold text-gray-900">
            BreatheSafeAI
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink
            to="/app"
            className="text-gray-700 text-xl font-medium hover:text-teal-400"
          >
            Home
          </NavLink>
          <NavLink
            to="/app/dashboard"
            className="text-gray-700 text-xl font-medium hover:text-teal-400"
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/app/health-insights"
            className="text-gray-700 text-xl font-medium hover:text-teal-400"
          >
            Health Insights
          </NavLink>
          <NavLink
            to="/app/air-quality"
            className="text-gray-700 text-xl font-medium hover:text-teal-400"
          >
            Air Quality
          </NavLink>

          {!user  ? (
            <Link
              to="/auth"
              className="text-gray-700  text-xl font-medium hover:text-teal-400"
            >
              Login
            </Link>
          ) : (
            <div className="relative">
              <div
                className="w-12 h-10 text-xl rounded-full bg-teal-400 text-white flex items-center justify-center font-bold cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
   {user.avatarUrl && !imgError ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
          onError={() => setImgError(true)} // will catch 429
          className="w-12 h-12 rounded-full object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-teal-400 text-white flex items-center justify-center font-bold text-xl">
          {fallback}
        </div>
      )}    </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 h-32  bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="font-semibold text-2xl">{user.name}</p>
                    <p className="text-xl text-gray-500">
                      {user.email? user.email : user.phone}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <i className="fa-solid fa-right-from-bracket"></i> Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden flex flex-col">
          <button
            className="text-black text-2xl p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <i className="fa-solid fa-xmark"></i>
            ) : (
              <i className="fa-solid fa-bars"></i>
            )}
          </button>
          {isMenuOpen && (
            <div className="flex flex-col bg-white border-t border-gray-200 mt-2 p-4 space-y-2">
              <NavLink
                to="/app"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-teal-400"
              >
                Home
              </NavLink>
              <NavLink
                to="/app/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-teal-400"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/app/health-insights"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-teal-400"
              >
                Health Insights
              </NavLink>
              <NavLink
                to="/app/air-quality"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-teal-400"
              >
                Air Quality
              </NavLink>
              {isLoggedIn ? (
                <button
                  className="text-gray-700 hover:text-teal-400 text-left"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  Logout ({user.name})
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 hover:text-teal-400"
                >
                  Login
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
