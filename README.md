# 🌌 Cosmos
### A 2D Multiplayer Social Environment

Virtual Cosmos is a space where users can navigate a shared coordinate system, interact through proximity-based chat, and personalize their appearance with custom avatars and colors.

![Banner Placeholder](https://via.placeholder.com/1200x400/00010a/ffffff?text=VIRTUAL+COSMOS)

---

## ✨ Key Features

- **🏆 Persistent Identity System**: Create your explorer with a custom nickname, uploaded avatar, and a unique **Signature Color** that defines your presence in the cosmos.
- **🚀 Advanced Collision Engine**: Intelligent, server-side-aware collision resolution ensures you never overlap with others and always find a clear spot to land when spawning.
- **🏮 Proximity-Based Aura**: Markers feature a signature-colored "diffused glow" that activates as you approach others, signaling the start of a connection.
- **💬 Real-Time Cosmic Chat**: Chat with those near you! High-speed communication powered by Socket.io, isolated to your local cosmic neighborhood.
- **🎞️ Cinematic Animations**: Smooth alpha-fading transitions for players joining or leaving the galaxy, providing a premium, fluid feel.
- **🛸 Tab-Isolated Sessions**: Powered by `sessionStorage`, allowing you to play as multiple different explorers across various browser tabs simultaneously.

---

## 🛠️ Tech Stack

- **Frontend**: 
  - [React](https://reactjs.org/) (User Interface)
  - [Pixi.js v8](https://pixijs.com/) (High-performance 2D WebGL Rendering)
  - [Socket.io-client](https://socket.io/) (Real-time events)
  - [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) (Premium aesthetics & micro-animations)
  
- **Backend**:
  - [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
  - [Socket.io](https://socket.io/) (Handshakes & movement sync)
  - [Nodemon](https://nodemon.io/) (Development auto-reloading)

---

## 🚀 Getting Started

Follow these steps to launch the cosmos on your local machine:

### 1. Prerequisites
Ensure you have **Node.js (v16+)** and **npm** installed.

### 2. Backend Setup
1. Open a terminal in `\backend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server (runs on port 3001):
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Open another terminal in `\frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the provided `localhost` URL in your browser.

---

## 🎮 How to Interact

- **Movement**: Use `W A S D` or **Arrow Keys** to steer your explorer through the starfield.
- **Customization**: When joining, pick one of the **16 Signature Colors** and upload your favorite avatar image.
- **Chat**: Type in the chat box when you are near someone to start a conversation.
- **Multiple Browsing**: Open a **New Tab** to spawn a fresh explorer and test the multiplayer interaction!

---

## 📸 Screenshots

*(Add your beautiful cosmic screenshots here)*

---

## 📜 License
*Virtual Cosmos - Distributed under the MIT License.*
