import Description from "./Description";
import "./Content.css";
import News from "./News";


export default function Content(){ 
    return (
        <>
            <div className="major">
                <News/>
                <Description/>
               
            </div>
        </>
    );
}