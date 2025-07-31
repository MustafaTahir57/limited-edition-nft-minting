import "./App.css";
import { Toaster } from "react-hot-toast";
import Mint from "./components/Mint";

const App = () => {
  return (
    <>
      <div>
        <Toaster position="top-right" />
        <Mint />
      </div>
    </>
  );
};

export default App;
