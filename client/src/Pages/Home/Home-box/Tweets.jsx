import './Tweets.css';

export default function Tweets() {
    return (
        <div className="social-card tweets">
            <h2><span role="img" aria-label="bird">🐦</span> Live Feed (X/Twitter)</h2>
            <div className="tweet-feed-list">
                
                <div className="tweet-item">
                    <p><strong>@BreatheSafeAI:</strong> New hyper-local AQI predictions just deployed! Check your neighborhood's 24-hour forecast now. #AirQuality #AI</p>
                    <a href="https://twitter.com/BreatheSafeAI" target="_blank" rel="noopener noreferrer">View Tweet</a>
                </div>
                
                <div className="tweet-item">
                    <p><strong>@HealthInsights:</strong> Great work by the BreatheSafe team. Their data correlation between AQI and respiratory visits is groundbreaking. </p>
                    <a href="https://twitter.com/HealthInsights" target="_blank" rel="noopener noreferrer">View Tweet</a>
                </div>

                <div className="tweet-item">
                    <p><strong>@BreatheSafeAI:</strong> Reminder: With winter smog approaching, ensure your home air purifiers are running efficiently. Stay safe! #CleanAir</p>
                    <a href="https://twitter.com/BreatheSafeAI" target="_blank" rel="noopener noreferrer">View Tweet</a>
                </div>

            </div>
            <button className="view-all-button">View on X (Twitter)</button>
        </div>
    );
}