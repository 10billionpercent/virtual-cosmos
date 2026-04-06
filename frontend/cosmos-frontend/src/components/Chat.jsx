import { useState, useEffect, useRef } from "react";
import socket from "../socket";

const Chat = ({ nearby, localNickname }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const chatRef = useRef(null);
  
  // Use a ref for nearby players to avoid constant re-subscribing to socket events
  const nearbyRef = useRef(nearby);
  useEffect(() => {
    nearbyRef.current = nearby;
  }, [nearby]);

  useEffect(() => {
    const handleMessage = (data) => {
      const isSelf = data.id === socket.id;
      // Use the ref to get the absolute latest proximity list without closure traps
      const isNearby = nearbyRef.current.some(p => p.id === data.id);

      if (isSelf || isNearby) {
        setMessages((prev) => {
          // Prevent duplicate messages if they arrive during re-renders
          if (prev.some(m => m.id === data.id && m.message === data.message && Math.abs(m.timestamp - data.timestamp) < 50)) {
            return prev;
          }
          return [...prev, { ...data, timestamp: Date.now() }];
        });
      }
    };

    socket.on("chat-message", handleMessage);
    return () => socket.off("chat-message", handleMessage);
  }, []); // Run once on mount

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
        Nearby: {nearbyNames || "Searching..."}
      </div>
      <div className="chat-messages" ref={chatRef}>
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.id === socket.id ? "own" : ""}`}>
            <span className="user-id">
              {m.id === socket.id ? "You" : m.nickname}
            </span>
            <span className="text">{m.message}</span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="chat-input-row">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
