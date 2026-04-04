import { useState } from "react";

const Signup = ({ onComplete }) => {
  const [avatar, setAvatar] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setAvatar(url);
  };

  return (
    <div className="signup">
      <h1>Hi 👋</h1>
      <h2>Welcome to Virtual Cosmos</h2>
      <p>Choose your avatar</p>

      <div className="avatar-preview">
        {avatar ? (
          <img src={avatar} alt="avatar" />
        ) : (
          <div className="placeholder">Upload</div>
        )}
      </div>

      <input type="file" accept="image/*" onChange={handleUpload} />

      <button 
        disabled={!avatar}
        onClick={() => onComplete(avatar)}
      >
        Enter Cosmos
      </button>
    </div>
  );
};

export default Signup;