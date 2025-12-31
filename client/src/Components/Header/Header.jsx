import lungslogo from "/src/assets/lungsLogo.png";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TranslateWidget from "../widget/TranslateWidget.jsx";
import "./Header.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [imgError, setImgError] = useState(false);

  const fallback = user?.name ? user.name.charAt(0).toUpperCase() : "?";
  
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/auth");
  };

  const navLinks = [
    { name: "Dashboard", path: "/app/dashboard" },
    { name: "Health Insights", path: "/app/health-insights" },
    { name: "Air Quality", path: "/app/air-quality" },
    { name: "Diseases Info", path: "/Diseases-info" },
    { name: "Health Assessment", path: "/app/health-assessment" },
    { name: "Health Report", path: "/app/health-report" },
    { name: "Climate Modal", path: "/ClimateModal" },
  ];

  return (
    <header className="header-main">
      <div className="header-container">
        
        {/* LEFT: Logo & Brand Name */}
        <div className="logo-section" onClick={() => navigate("/app")}>
          <img src={lungslogo} alt="Logo" className="logo-img" />
          <span className="logo-text">
            BreatheSafe <span className="highlight">AI</span>
          </span>
        </div>

        {/* RIGHT: Combined Actions Area */}
        <div className="actions-wrapper">
          
          {/* Desktop Links (Hidden on mobile) */}
          <nav className="desktop-nav">
            {navLinks.map((link) => (
              <NavLink 
                key={link.path} 
                to={link.path} 
                className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Language Selector */}
          <div className="translate-container">
            <TranslateWidget />
          </div>

          {/* User Profile (If Logged In) */}
          {user && (
            <div className="profile-container">
              <div className=" avatar-circle" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {user.avatarUrl && !imgError ? (
                    <img src={user.avatarUrl} alt="User" onError={() => setImgError(true)} />
                ) : fallback}
              </div>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="font-semibold text-lg">{user.name}</p>
                    <p className="text-sm text-gray-500">
                      {user.email ?? user.phone}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <i className="fa-solid fa-right-from-bracket"></i> Log out
                  </button>
                </div>
                // <div className="desktop-user-dropdown">
                //   <button onClick={handleLogout} className="logout-btn">Logout</button>
                // </div>
              )}
            </div>
          )}

          {/* Hamburger Menu (Mobile Only) */}
          <button className="mobile-toggle" onClick={() => setIsMenuOpen(true)}>
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER (SIDE MENU) */}
      <div className={`mobile-drawer ${isMenuOpen ? "drawer-open" : "drawer-closed"}`}>
        <div className="drawer-header">
           <span className="logo-text">BreatheSafe <span className="highlight">AI</span></span>
           <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
             <i className="fa-solid fa-xmark"></i>
           </button>
        </div>
        
        <span className="flex felx-row">
          <div className=" avatar-circle-menu">
            {user.avatarUrl && !imgError ? (
              <img src={user.avatarUrl} alt="User" onError={() => setImgError(true)} />
            ) : fallback}
          </div>
          <div className="p-3 border-b border-gray-100">
            <p className="font-semibold text-sm">{user.name}</p>
          </div>
        </span>
        <nav className="drawer-nav">
          {navLinks.map((link) => (
            <NavLink 
              key={link.path} 
              to={link.path} 
              onClick={() => setIsMenuOpen(false)} 
              className="drawer-item"
            >
              {link.name}
            </NavLink>
          ))}
          {!user ? (
            <Link to="/auth" className="drawer-item auth-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
          ) : (
            <button onClick={handleLogout} className="drawer-item auth-link logout">Logout</button>
          )}
        </nav>
      </div>
      
      {/* Background Overlay */}
      {isMenuOpen && <div className="drawer-overlay" onClick={() => setIsMenuOpen(false)}></div>}
    </header>
  );
}