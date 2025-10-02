import Description from "./Description";
import Chatbot from "./Chatbot";
import "./Major.css";
import News from "./News";


export default function Major(){
    return (
        <>
            <div className="major">
                <News/>
                <Description/>
                <Chatbot/>
            </div>
        </>
    );
}