import "./Description.css";
// Corrected Import Path: Go up THREE levels to reach src, then go down into assets
import airQualityMap from "../../../assets/air_quality_map_snippet.png"; 

export default function Description() {
    return (
        <div className="description">
            <h2>🧠 About BreatheSafe AI</h2>
            <hr/>
            
           
<img 
    src={airQualityMap} 
    alt="Snippet of a map showing air quality data overlaid on a city"
    style={{ 
        width: '100%', 
        // ENSURE height is set to 'auto' or removed entirely
        height: 'auto', 
        objectFit: 'contain', 
        marginBottom: '10px',
        borderRadius: '4px' 
    }}
/>
                
            

            <p>
                <b>BreatheSafe AI</b> is your personal health and environmental companion. We leverage cutting-edge AI and comprehensive environmental data to provide real-time air quality forecasts, personalized health risk assessments, and disease information. 
            </p>
            <p>
                Our mission is to empower you with <b>accurate insights</b> to make informed decisions for a healthier life, one breath at a time.
            </p>
            
            <a href="/diseaseinfo" style={{ fontWeight: 'bold', color: '#007bff' }}>
                → Explore Our Health Insights
            </a>
        </div>
    );
}