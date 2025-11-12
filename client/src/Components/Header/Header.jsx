import lungslogo from "/src/assets/lungsLogo.png";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TranslateWidget from "../widget/TranslateWidget.jsx"; 

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [imgError, setImgError] = useState(false);

  const fallback = user?.name ? user.name.charAt(0).toUpperCase() : "?";
  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-md border-b border-gray-200">
      <div className=" w-full flex  justify-between h-20 px-6 md:px-10">
        {/* LEFT SECTION - Logo + Name */}
        <div className="flex items-center gap-2 cursor-pointer">
          <img
            src={lungslogo}
            alt="BreatheSafeAI"
            className="w-16 h-16 object-contain"
          />
          <NavLink
            to="/app"
            className="text-2xl  font-semibold text-gray-900 hover:text-teal-400"
          >
            BreatheSafe{" "}
            <span className="text-teal-500 hover:text-teal-400">AI</span>
          </NavLink>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center justify-end gap-6">
          {/* Desktop Navigation */}
{/* Desktop Navigation */}
<nav className="hidden md:flex items-center gap-6">
  <NavLink
    to="/app/dashboard"
    className={({ isActive }) => 
      isActive 
        ? "text-teal-500 font-semibold border-b-2 border-teal-500 pb-1" 
        : "text-gray-600 font-medium hover:text-teal-400"
    }
  >
    Dashboard
  </NavLink>
  <NavLink
    to="/app/health-insights"
    className={({ isActive }) => 
      isActive 
        ? "text-teal-500 font-semibold border-b-2 border-teal-500 pb-1" 
        : "text-gray-600 font-medium hover:text-teal-400"
    }
  >
    Health Insights
  </NavLink>
  <NavLink
    to="/app/air-quality"
    className={({ isActive }) => 
      isActive 
        ? "text-teal-500 font-semibold border-b-2 border-teal-500 pb-1" 
        : "text-gray-600 font-medium hover:text-teal-400"
    }
  >
    Air Quality
  </NavLink>
  <NavLink
    to="/Diseases-info"
    className={({ isActive }) => 
      isActive 
        ? "text-teal-500 font-semibold border-b-2 border-teal-500 pb-1" 
        : "text-gray-600 font-medium hover:text-teal-400"
    }
  >
    Diseases Info
  </NavLink>
  <NavLink
    to="/app/health-assessment"
    className={({ isActive }) => 
      isActive 
        ? "text-teal-500 font-semibold border-b-2 border-teal-500 pb-1" 
        : "text-gray-600 font-medium hover:text-teal-400"
    }
  >
    Health Assessment
  </NavLink>
  <NavLink
    to="/app/health-report"
    className={({ isActive }) => 
      isActive 
        ? "text-teal-500 font-semibold border-b-2 border-teal-500 pb-1" 
        : "text-gray-600 font-medium hover:text-teal-400"
    }
  >
    Health Report
  </NavLink>
  <NavLink
    to="/ClimateModal"
    className={({ isActive }) => 
      isActive 
        ? "text-teal-500 font-semibold border-b-2 border-teal-500 pb-1" 
        : "text-gray-600 font-medium hover:text-teal-400"
    }
  >
    Climate Modal
  </NavLink>
</nav>
          <div className="hidden md:block">
            <TranslateWidget />
          </div>

          {/* Auth / Profile */}
          {!user ? (
            <Link
              to="/auth"
              className="hidden md:block text-gray-600 font-medium hover:text-teal-400"
            >
              Login
            </Link>
          ) : (
            <div className="relative">
              <div
                className="w-12 h-12 rounded-full bg-teal-400 text-white flex items-center justify-center font-bold cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {user.avatarUrl && !imgError ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    onError={() => setImgError(true)}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  fallback
                )}
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
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-2xl text-gray-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <i className="fa-solid fa-xmark"></i>
            ) : (
              <i className="fa-solid fa-bars"></i>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col bg-white border-t border-gray-200 mt-2 p-4 space-y-2">
             <div className="mb-3 pb-3 border-b border-gray-200">
            <TranslateWidget />
          </div>
          
          <NavLink
            to="/app/dashboard"
            className="text-gray-700 hover:text-teal-400"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/app/health-insights"
            className="text-gray-700 hover:text-teal-400"
            onClick={() => setIsMenuOpen(false)}
          >
            Health Insights
          </NavLink>
          <NavLink
            to="/app/air-quality"
            className="text-gray-700 hover:text-teal-400"
            onClick={() => setIsMenuOpen(false)}
          >
            Air Quality
          </NavLink>
          <NavLink
            to="/Diseases-info"
            className="text-gray-700 hover:text-teal-400"
            onClick={() => setIsMenuOpen(false)}
          >
            Diseases Info
          </NavLink>
          {!user ? (
            <Link
              to="/auth"
              className="text-gray-700 hover:text-teal-400"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          ) : (
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="text-gray-700 hover:text-teal-400 text-left"
            >
              Logout ({user.name})
            </button>
          )}
        </div>
      )}
    </header>
  );
}
