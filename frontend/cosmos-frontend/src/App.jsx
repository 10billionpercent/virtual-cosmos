import { useState, useEffect } from "react";
import Signup from "./components/Signup";
import Cosmos from "./components/Cosmos";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("cosmos-user");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Clear legacy blob URLs (they are no longer valid)
        if (data.avatar && data.avatar.startsWith("blob:")) {
          localStorage.removeItem("cosmos-user");
        } else {
          setUser(data);
        }
      } catch (e) {
        console.error("Failed to load user data");
      }
    }
    setLoading(false);
  }, []);

  const handleComplete = (data) => {
    localStorage.setItem("cosmos-user", JSON.stringify(data));
    setUser(data);
  };

  const handleExit = () => {
    localStorage.removeItem("cosmos-user");
    setUser(null);
  };

  if (loading) return null;

  if (!user) {
    return <Signup onComplete={handleComplete} />;
  }

  return <Cosmos avatar={user.avatar} nickname={user.nickname} onExit={handleExit} />;
}

export default App;