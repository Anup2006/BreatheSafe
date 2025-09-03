import lungslogo from "../assets/lungslogo.png";
import "./Header.css"; 
import { useState } from "react";

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
        <button  className="nav-link active">Home</button>
        <button  className="nav-link">Dashboard</button>
        <button  className="nav-link">Health Insights</button>
        <button  className="nav-link">Air Quality</button>
        {!isLoggedIn && (
          <button className="nav-link" onClick={() => setIsLoggedIn(true)}>
            Login
          </button>
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
            <a href="#" onClick={() => {  setIsMenuOpen(false) }}>Home</a>
            <a href="#" onClick={() => { setIsMenuOpen(false) }}>Dashboard</a>
            <a href="#" onClick={() => { setIsMenuOpen(false) }}>Health Insights</a>
            <a href="#" onClick={() => { setIsMenuOpen(false) }}>Air Quality</a>
            <a href="#" onClick={() => { setIsLoggedIn(!isLoggedIn); setIsMenuOpen(false); }}>
              {isLoggedIn ? 'Logout ( User )' : 'Login'}  </a>
          </div>
        )}
      </div>
    </header>
    </>
  );
}