import { useState } from "react";
import Signup from "./components/Signup";
import Cosmos from "./components/Cosmos";
import "./index.css";

function App() {
  const [avatar, setAvatar] = useState(null);

  if (!avatar) {
    return <Signup onComplete={setAvatar} />;
  }

  return <Cosmos avatar={avatar} />;
}

export default App;