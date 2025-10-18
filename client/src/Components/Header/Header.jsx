import lungslogo from "/src/assets/lungslogo.png";
import "./Header.css";
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // ✅ Load user from localStorage on page load
  useEffect(() => {
    const storedUser = localStorage.getItem("userName");
    if (storedUser) {
      setIsLoggedIn(true);
      setUserName(storedUser);
    }
  }, []);

  // ✅ Logout handler (now redirects to /auth)
  const handleLogout = () => {
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setUserName("");
    navigate("/auth");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-inner">
          {/* Logo */}
          <div className="logo-section">
            <div className="logo-wrapper">
              <img src={lungslogo} alt="BreatheSafeAI" className="logo" />
            </div>
            <span className="title">BreatheSafeAI</span>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="nav">
        <Link to="/app">Home</Link>
        <Link to="/app/dashboard">Dashboard</Link>
        <Link to="/app/health-insights">Health Insights</Link>
        <Link to="/app/air-quality">Air Quality</Link>

        {!isLoggedIn ? (
          <Link to="/auth" className="nav-link">
            Login
          </Link>
        ) : (
          <div className="dropdown">
            <div className="avatar-btn">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="dropdown-content">
              <div className="dropdown-header">
                <p className="name">{userName}</p>
                <p className="email">
                  {userName.toLowerCase().replace(/\s+/g, "")}@gmail.com
                </p>
              </div>
              <div className="dropdown-separator"></div>
              <div className="dropdown-item" onClick={handleLogout}>
                <span className="icon">
                  <i className="fa-solid fa-right-from-bracket"></i>
                </span>
                Log out
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      <div id="menu">
        <button
          className="menu-btn"
          id="menuToggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <i className="fa-solid fa-xmark" id="xmark"></i>
          ) : (
            <i className="fa-solid fa-bars"></i>
          )}
        </button>

        {isMenuOpen && (
          <div className="mobile-menu" id="mobileMenu">
            <NavLink to="/" onClick={() => setIsMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/dashboard" onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </NavLink>
            <NavLink to="/health-insights" onClick={() => setIsMenuOpen(false)}>
              Health Insights
            </NavLink>
            <NavLink to="/air-quality" onClick={() => setIsMenuOpen(false)}>
              Air Quality
            </NavLink>
            {isLoggedIn ? (
              <button
                className="mobile-link-btn"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                Logout ({userName})
              </button>
            ) : (
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
