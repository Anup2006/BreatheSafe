import "./Footer.css";
import lungslogo from "/src/assets/lungslogo.png";

export default function Footer() {
  return (
      <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                {/*  Brand  */}
                <div class="brand">
                    <div class="brand-logo">
                        <img src={lungslogo} alt="BreatheSafe" class="logo" />
                        <span class="brand-name">BreatheSafeAI</span>
                    </div>
                        <p class="brand-text">
                        Empowering respiratory health through AI-powered insights and real-time air quality monitoring. 
                        Breathe easier with personalized predictions and healthcare support.
                        </p>
                        <div class="social-links">
                        <a href="#" title="Facebook"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" title="Twitter"><i class="fab fa-twitter"></i></a>
                        <a href="#" title="Instagram"><i class="fab fa-instagram"></i></a>
                        <a href="#" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>

                {/*  Quick Links  */}
                <div>
                    <h3 class="footer-title">Quick Links</h3>
                    <ul class="footer-links">
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Features</a></li>
                        <li><a href="#">Dashboard</a></li>
                        <li><a href="#">Pricing</a></li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </div>

                {/*  Support  */}
                <div>
                    <h3 class="footer-title">Support</h3>
                    <ul class="footer-links">
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms of Service</a></li>
                        <li><a href="#">Medical Disclaimer</a></li>
                        <li><a href="#">Data Security</a></li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <p>© 2025 BreatheSafeAI. All rights reserved.</p>
                <p>This platform is not intended to replace professional medical advice.</p>
            </div>
        </div>
    </footer>
  );
}