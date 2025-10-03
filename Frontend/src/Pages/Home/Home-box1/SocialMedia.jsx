import Tweets from "./Tweets";
import Videos from "./Videos";
import './SocialMedia.css';

export default function SocialMedia() {
    return ( 
        <>
            <div className="content">
                <Tweets/>
                <Videos/>
            </div>
        </>
    );
} 