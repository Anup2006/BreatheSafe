import lungslogo from "/src/assets/lungslogo.png";
import "./Header.css"; 
import { useState } from "react";
import {Link,NavLink} from "react-router-dom";

export default function Header() {
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  return (
    <>
     <header className="header">
      <div className="header-container">
        <div className="header-inner">
          {/* Logo */}
          <div className="logo-section" onclick="onNavigate('home')">
            <div className="logo-wrapper">
              <img src={lungslogo} alt="BreatheSafeAI" className="logo" />
            </div>
            <span className="title">BreatheSafeAI</span>
          </div>
        </div>
      </div>
      
      {/* Desktop Navigation  */}
      <nav class="nav">
        <NavLink to="/" className="nav-link">Home</NavLink>
        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
        <NavLink to="/health-insights" className="nav-link">Health Insights</NavLink>
        <NavLink to="/air-quality" className="nav-link">Air Quality</NavLink>
        {!isLoggedIn && (
          <Link to="#" className="nav-link" onClick={() => setIsLoggedIn(true)}>
            Login
          </Link>
        )}
        {isLoggedIn &&
            <div className="dropdown">
              <div className="avatar-btn">U</div>
              <div className="dropdown-content">
                <div className="dropdown-header">
                  <p className="name">User</p>
                  <p className="email">user@example.com</p>
                </div>
                <div className="dropdown-separator"></div>
                <div className="dropdown-item">
                  {/*  Dashboard icon  */}
                  <span className="icon"><i className="fa-solid fa-user"></i></span>
                  Dashboard
                </div>
                <div className="dropdown-separator"></div>
                <div className="dropdown-item" onClick={() => setIsLoggedIn(false)}>
                  {/*  Logout icon  */}
                  <span className="icon"><i className="fa-solid fa-right-from-bracket"></i></span>
                  Log out
                </div>
              </div>
            </div>
        }
      </nav>

      <div id="menu">
        {/* Mobile Menu Button */}
        <button className="menu-btn" id="menuToggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? (
            <i className="fa-solid fa-xmark" id="xmark"></i>
          ) : (
            <i className="fa-solid fa-bars" ></i>
          )}
        </button>
        {/*  Mobile Menu  */}
        {isMenuOpen && (
          <div className="mobile-menu" id="mobileMenu">
            <NavLink to="/" onClick={() => {  setIsMenuOpen(false) }}>Home</NavLink>
            <NavLink to="/dashboard" onClick={() => { setIsMenuOpen(false) }}>Dashboard</NavLink>
            <NavLink to="/health-insights" onClick={() => { setIsMenuOpen(false) }}>Health Insights</NavLink>
            <NavLink to="/air-quality" onClick={() => { setIsMenuOpen(false) }}>Air Quality</NavLink>
            <Link to="#" onClick={() => { setIsLoggedIn(!isLoggedIn); setIsMenuOpen(false); }}>
              {isLoggedIn ? 'Logout ( User )' : 'Login'}  </Link>
          </div>
        )}
      </div>
    </header>
    </>
  );
}