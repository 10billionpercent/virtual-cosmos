import { useState } from "react";
import Cosmos from "./components/Cosmos";

function App() {
  const [avatar, setAvatar] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setAvatar(url);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
      />

      <Cosmos avatar={avatar} />
    </div>
  );
}

export default App;