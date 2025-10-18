import Description from "./Description";
import Chatbot from "./Chatbot";
import "./Content.css";
import News from "./News";


export default function Conetnt(){
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