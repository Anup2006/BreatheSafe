import lungslogo from "/src/assets/lungsLogo.png";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TranslateWidget from "../widget/TranslateWidget.jsx";
import { MapPin, User, LogOut, ChevronDown, Bell } from "lucide-react";
import "./Header.css";

export default function Header() {
  const { awards } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [imgError, setImgError] = useState(false);

  const fallback = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  const activeAlertsCount = user?.preferences
    ? Object.values(user.preferences).filter((val) => val === true).length
    : 0;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
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
        <div className="logo-section" onClick={() => navigate("/app")}>
          <img src={lungslogo} alt="Logo" className="logo-img" />
          <span className="logo-text">
            BreatheSafe <span className="highlight">AI</span>
          </span>
        </div>

        <div className="actions-wrapper">
          <nav className="desktop-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="translate-container">
            <TranslateWidget />
          </div>

          {user && (
            <div className="profile-container relative">
              <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="avatar-wrapper relative">
                  <div className="avatar-circle">
                    {user.avatarUrl && !imgError ? (
                      <img
                        src={user.avatarUrl}
                        alt="User"
                        onError={() => setImgError(true)}
                        className="rounded-full w-full h-full object-cover"
                      />
                    ) : (
                      fallback
                    )}
                  </div>

                  {/* 🏅 Badge overlay */}
                  {awards && (
                    <div
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#2ec4b6] flex items-center justify-center shadow-md border border-white"
                      title="Achievements earned"
                    >
                      <img
                        src="https://img.icons8.com/external-flatart-icons-solid-flatarticons/64/ffffff/external-rank-usa-flatart-icons-solid-flatarticons.png"
                        alt="Badge"
                        className="w-3 h-3"
                      />
                    </div>
                  )}
                </div>

                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 z-50 overflow-hidden">
                  <div className="p-5 bg-slate-50 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user.email ?? user.phone}
                    </p>
                  </div>
                  <div className="px-5 py-3 border-b border-slate-50">
                    <div className="flex items-center gap-2 text-cyan-600">
                      <MapPin size={14} />
                      <p className="text-xs font-bold truncate">
                        {user.city || "Pune"}, {user.state || "Maharashtra"}
                      </p>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate("/app/profile");
                        setIsDropdownOpen(false);
                      }}
                      className="dropdown-item"
                    >
                      <User size={16} /> View Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item text-red-500"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button className="mobile-toggle" onClick={() => setIsMenuOpen(true)}>
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <div
        className={`mobile-drawer ${
          isMenuOpen ? "drawer-open" : "drawer-closed"
        }`}
      >
        <div className="drawer-header">
          <span className="logo-text">
            BreatheSafe <span className="highlight">AI</span>
          </span>
          <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {user && (
          <div className="p-4 mx-4 bg-slate-50 rounded-2xl mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar-circle-menu">{fallback}</div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-800 text-sm truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-cyan-600 font-bold uppercase">
                  {user.city || "Pune"}
                </p>
              </div>
            </div>
            {/* Added View Profile to Mobile Navigation */}
            <button
              onClick={() => {
                navigate("/app/profile");
                setIsMenuOpen(false);
              }}
              className="w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-2"
            >
              <User size={14} /> View Profile
            </button>
          </div>
        )}

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
          {user && (
            <button onClick={handleLogout} className="drawer-item text-red-500">
              Logout
            </button>
          )}
        </nav>
      </div>
      {isMenuOpen && (
        <div
          className="drawer-overlay"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </header>
  );
}
