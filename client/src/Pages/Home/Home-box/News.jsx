import "./News.css";

export default function News() {
    return (
        <div className="news">
            <h2>📢 Latest Updates</h2>
            <hr/>
            <p>
                Stay tuned for the latest updates and announcements from our college. We regularly share news about academic achievements, campus events, research breakthroughs, and more. Don't miss out on important information that keeps you connected with our vibrant community.
            </p>
            
            <div className="news-item">
                <p><strong>Nov 11, 2025:</strong> New AI model deployed for hyper-local air quality prediction.</p>
                <a href="#">Read More</a>
            </div>
            <div className="news-item">
                <p><strong>Nov 05, 2025:</strong> Campus Health Initiative: Free lung health checkups next week!</p>
                <a href="#">Read More</a>
            </div>
            
            <button style={{ marginTop: '1rem' }}>View All News</button>
        </div>
    );
}