import "./Footer.css";
import lungslogo from "/src/assets/lungslogo.png";

export default function Footer() {
  return (
      <footer className="footer">
        <div className="container">
            <div className="footer-grid">
                {/*  Brand  */}
                <div className="brand">
                    <div className="brand-logo">
                        <img src={lungslogo} alt="BreatheSafe" className="logo" />
                        <span className="brand-name">BreatheSafeAI</span>
                    </div>
                        <p className="brand-text">
                        Empowering respiratory health through AI-powered insights and real-time air quality monitoring. 
                        Breathe easier with personalized predictions and healthcare support.
                        </p>
                        <div className="social-links">
                        <a href="#" title="Facebook"><i className="fab fa-facebook-f"></i></a>
                        <a href="#" title="Twitter"><i className="fab fa-twitter"></i></a>
                        <a href="#" title="Instagram"><i className="fab fa-instagram"></i></a>
                        <a href="#" title="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                </div>

                {/*  Quick Links  */}
                <div>
                    <h3 className="footer-title">Quick Links</h3>
                    <ul className="footer-links">
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Features</a></li>
                        <li><a href="#">Dashboard</a></li>
                        <li><a href="#">Pricing</a></li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </div>

                {/*  Support  */}
                <div>
                    <h3 className="footer-title">Support</h3>
                    <ul className="footer-links">
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms of Service</a></li>
                        <li><a href="#">Medical Disclaimer</a></li>
                        <li><a href="#">Data Security</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2025 BreatheSafeAI. All rights reserved.</p>
                <p>This platform is not intended to replace professional medical advice.</p>
            </div>
        </div>
    </footer>
  );
}