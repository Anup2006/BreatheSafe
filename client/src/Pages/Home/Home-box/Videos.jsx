import './Videos.css';

export default function Videos() {
    const videoEmbeds = [
        { id: 'rn9eUIbqCPU', title: 'Understanding the AQI Scale and Health Impact' }, 
        { id: '4MNJvZtczps', title: 'How to Read Your Personalized Health Report' }, 
        { id: 'GqbWyEQ58PY', title: 'BreatheSafe AI: Quick Start Tutorial' }, 
        { id: 'Aabz4MHXgT4', title: 'Air Quality and Respiratory Diseases Explained' }, 
    ];

    return (
        <div className="social-card videos">
            <h2><span role="img" aria-label="video">▶️</span> Educational Videos</h2>
            
            <div className="video-grid">
                {videoEmbeds.map((video, index) => (
                    <div className="video-item" key={index}>
                        <div className="video-responsive">
                            <iframe
                                src={`https://www.youtube.com/embed/${video.id}`}
                                title={video.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        {/* Title will now wrap naturally to as many lines as needed */}
                        <p>{video.title}</p>
                    </div>
                ))}
            </div>

            <button className="view-all-button view-youtube">Watch All on YouTube</button>
        </div>
    );
}