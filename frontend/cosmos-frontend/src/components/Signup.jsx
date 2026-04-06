import { useState } from "react";

const Signup = ({ onComplete }) => {
  const [avatar, setAvatar] = useState(null);
  const [nickname, setNickname] = useState("");

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Aspect-ratio aware crop (Object-fit: cover)
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 128;
        canvas.height = 128;
        
        const scale = Math.max(128 / img.width, 128 / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (128 - w) / 2;
        const y = (128 - h) / 2;
        
        ctx.drawImage(img, x, y, w, h);
        setAvatar(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleEnter = () => {
    if (avatar && nickname.trim()) {
      onComplete({ avatar, nickname: nickname.trim() });
    }
  };

  return (
    <div className="signup">
      <div className="avatar-preview">
        {avatar ? (
          <img src={avatar} alt="avatar" />
        ) : (
          <div className="placeholder">?</div>
        )}
      </div>

      <h1>Join the Cosmos</h1>
      <h2>Secure your identity before jumping in</h2>

      <div className="signup-input-group">
        <label>Choose a nickname</label>
        <input 
          type="text" 
          placeholder="e.g. StarLord" 
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={15}
        />
      </div>

      <div className="signup-input-group">
        <label>Avatar</label>
        <label className="file-label" htmlFor="avatar-upload">
          {avatar ? "Change Image" : "Upload Picture"}
        </label>
        <input 
          id="avatar-upload"
          type="file" 
          accept="image/*" 
          onChange={handleUpload} 
        />
      </div>

      <button 
        disabled={!avatar || !nickname.trim()}
        onClick={handleEnter}
      >
        Enter Cosmos
      </button>
    </div>
  );
};

export default Signup;