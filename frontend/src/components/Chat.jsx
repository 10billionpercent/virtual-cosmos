import { useState, useEffect, useRef } from "react";
import socket from "../socket";

const Chat = ({ nearby, localNickname }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const chatRef = useRef(null);
  
  // Use a stable ref for nearby players to avoid closure traps
  const nearbyRef = useRef(nearby);
  useEffect(() => {
    nearbyRef.current = nearby;
  }, [nearby]);

  useEffect(() => {
    const handleMessage = (data) => {
      console.log('Incoming Message:', data);
      
      setMessages((prev) => {
        // Prevent total duplicate messages (exact same id and timestamp)
        if (prev.some(m => m.timestamp === data.timestamp && m.id === data.id)) {
          return prev;
        }
        return [...prev, data];
      });
    };

    socket.on("chat-message", handleMessage);
    return () => socket.off("chat-message", handleMessage);
  }, []); 

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("chat-message", { message });
      setMessage("");
    }
  };

  const nearbyNames = nearby
    .map(p => p.nickname)
    .filter(name => name && name.trim())
    .join(", ");

  return (
    <div className="chat-container">
      <div className="chat-header">
        Nearby: {nearbyNames || "Searching for explorers..."}
      </div>
      <div className="chat-messages" ref={chatRef}>
        {messages.length === 0 && (
          <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', marginTop: '20px' }}>
            No cosmic broadcasts yet...
          </div>
        )}
        {messages.map((m, i) => {
          const isOwn = m.id === socket.id;
          const prevMsg = i > 0 ? messages[i-1] : null;
          const isFirstInBlock = !prevMsg || prevMsg.id !== m.id;
          
          // Try to lookup sender's nickname if the message itself is missing it
          const senderName = m.nickname || nearby.find(p => p.id === m.id)?.nickname || "Cosmos Explorer";
          
          return (
            <div 
              key={i} 
              className={`message ${isOwn ? "own" : ""} ${isFirstInBlock ? "first" : "continuation"}`}
            >
              {isFirstInBlock && (
                <span className="user-id">
                  {isOwn ? "You" : senderName}
                </span>
              )}
              <span className="text">{m.message}</span>
            </div>
          );
        })}
      </div>
      <form onSubmit={sendMessage} className="chat-input-row">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={nearby.length > 0 ? "Type a message..." : "No one nearby to hear you..."}
          disabled={nearby.length === 0}
        />
        <button type="submit" disabled={nearby.length === 0}>Send</button>
      </form>
    </div>
  );
};

export default Chat;
