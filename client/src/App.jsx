import Header from "./Components/Header/Header.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <>
      <Header />
      {/* This will render the child routes like Home,  Dashboard, etc. */}
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
