import Tweets from "./Tweets";
import Videos from "./Videos";
import './Content.css';

export default function Content() {
    return ( 
        <>
            <div className="content">
                <Tweets/>
                <Videos/>
            </div>
        </>
    );
} 