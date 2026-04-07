import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import createMarker from "./Marker";
import socket from "../socket";
import Chat from "./Chat";

const Cosmos = ({ avatar, nickname, color, onExit, onUpdateUser }) => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const playersRef = useRef(new Map());
  const [nearbyPlayers, setNearbyPlayers] = useState([]);
  const keys = useRef({});

  useEffect(() => {
    let mounted = true;
    let cleanupFunc = null;

    const init = async () => {
      // 1. Create App
      const app = new PIXI.Application();
      
      // 2. Initialize
      await app.init({
        resizeTo: window,
        background: "#000108ff",
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (!mounted || !canvasRef.current) {
        app.destroy(true);
        return;
      }

      // 3. Attach
      canvasRef.current.appendChild(app.canvas);
      appRef.current = app;

      const WORLD_SIZE = 5000;
      
      // GRID
      const grid = new PIXI.Graphics();
      grid.setStrokeStyle({ width: 1, color: 0x1e293b, alpha: 0.3 });
      for (let i = 0; i <= WORLD_SIZE; i += 100) {
        grid.moveTo(i, 0).lineTo(i, WORLD_SIZE);
        grid.moveTo(0, i).lineTo(WORLD_SIZE, i);
      }
      grid.stroke();
      app.stage.addChild(grid);

      // STARS (Efficient draw)
      const stars = new PIXI.Graphics();
      for (let i = 0; i < 1200; i++) {
        const x = Math.random() * WORLD_SIZE;
        const y = Math.random() * WORLD_SIZE;
        const radius = Math.random() < 0.1 ? 2 : Math.random() * 1.2;
        stars.circle(x, y, radius);
      }
      stars.fill({ color: 0xffffff, alpha: 0.6 }); // Single fill for all circles!
      app.stage.addChild(stars);

      const addPlayer = (p, isLocal) => {
        if (!playersRef.current || playersRef.current.has(p.id)) return;

        const pColor = isLocal ? color : p.color;
        const marker = createMarker(PIXI.Texture.WHITE, isLocal, pColor);
        marker.x = p.x;
        marker.y = p.y;
        marker.playerId = p.id;
        marker.nickname = p.nickname || "Explorer";
        marker.setNickname(marker.nickname);
        marker.alpha = 0; // Start invisible for fade-in
        
        app.stage.addChild(marker);
        playersRef.current.set(p.id, marker);

        const pAvatar = isLocal ? avatar : p.avatar;
        if (pAvatar) {
          const img = new Image();
          img.src = pAvatar;
          img.onload = () => {
             if (marker && !marker.destroyed) marker.setAvatar(PIXI.Texture.from(img));
          };
        }
      };

      socket.on("current-players", (players) => {
        Object.values(players).forEach(p => addPlayer(p, p.id === socket.id));
      });
      socket.on("player-joined", p => addPlayer(p, p.id === socket.id));
      socket.on("player-moved", p => {
        const m = playersRef.current?.get(p.id);
        if (m && p.id !== socket.id) { m.x = p.x; m.y = p.y; }
      });
      socket.on("player-left", id => {
        const m = playersRef.current?.get(id);
        if (m) { m.isLeaving = true; } // Trigger fade-out instead of instant removal
      });

      socket.on("join-success", (data) => {
        const checkMarker = () => {
          const me = playersRef.current?.get(socket.id);
          if (me) {
            console.log("Syncing unique nickname to marker:", data.nickname);
            me.nickname = data.nickname;
            me.setNickname(data.nickname);
          } else {
            // Marker might not be ready yet, retry in 100ms
            setTimeout(checkMarker, 100);
          }
        };
        checkMarker();
        if (onUpdateUser) onUpdateUser({ nickname: data.nickname });
      });

      socket.emit("join", { avatar, nickname, color });

      const tickerCallback = (ticker) => {
        const delta = ticker.deltaTime;

        // --- Animations (Fade In/Out) ---
        playersRef.current.forEach((m, id) => {
          if (m.isLeaving) {
            m.alpha -= 0.05 * delta;
            if (m.alpha <= 0) {
              app.stage.removeChild(m);
              playersRef.current.delete(id);
              m.destroy({ children: true });
            }
          } else if (m.alpha < 1) {
            m.alpha += 0.04 * delta;
            if (m.alpha > 1) m.alpha = 1;
          }
        });

        const me = playersRef.current?.get(socket.id);
        
        // Ensure app.screen has dimensions before centering
        const sw = app.screen.width || window.innerWidth;
        const sh = app.screen.height || window.innerHeight;

        if (me) {
          let dx = 0;
          let dy = 0;
          const speed = 5;
          if (keys.current["w"] || keys.current["ArrowUp"]) { dy -= speed; }
          if (keys.current["s"] || keys.current["ArrowDown"]) { dy += speed; }
          if (keys.current["a"] || keys.current["ArrowLeft"]) { dx -= speed; }
          if (keys.current["d"] || keys.current["ArrowRight"]) { dx += speed; }

          let nextX = me.x + dx;
          let nextY = me.y + dy;
          let finalMoved = false;

          // Advanced Collision & Internal Separation
          playersRef.current.forEach((other, otherId) => {
            if (otherId === socket.id) return;
            
            const dist = Math.hypot(me.x - other.x, me.y - other.y);
            const SAFE_DIST = 85;

            if (dist < SAFE_DIST) {
              // 1. SOFT REPEL: Move slightly away if overlapping (resolves spawn-on-top)
              const angle = Math.atan2(me.y - other.y, me.x - other.x);
              const pushPower = 1.5;
              me.x += Math.cos(angle) * pushPower;
              me.y += Math.sin(angle) * pushPower;
              finalMoved = true;
            }

            // 2. INTELLIGENT BLOCK: Check if user input makes collision WORSE
            if (dx !== 0 || dy !== 0) {
              const nextDistX = Math.hypot(nextX - other.x, me.y - other.y);
              const nextDistY = Math.hypot(me.x - other.x, nextY - other.y);

              // If next move is inside range AND closer than current position, block it
              if (nextDistX < SAFE_DIST && nextDistX < dist) dx = 0;
              if (nextDistY < SAFE_DIST && nextDistY < dist) dy = 0;
            }
          });

          if (dx !== 0 || dy !== 0) {
            me.x += dx;
            me.y += dy;
            finalMoved = true;
          }

          if (finalMoved) {
            socket.emit("move", { x: me.x, y: me.y });
          }
          
          // Center Camera
          app.stage.pivot.x = me.x - sw / 2;
          app.stage.pivot.y = me.y - sh / 2;

          // Proximity - LENIENT RANGE for better syncing (140)
          const nearby = [];
          playersRef.current.forEach((m, id) => {
            if (id === socket.id) return;
            const dist = Math.hypot(m.x - me.x, m.y - me.y);
            if (dist < 140) {
              nearby.push({ id, nickname: m.nickname });
              m.setHighlight(true);
            } else {
              m.setHighlight(false);
            }
          });
          setNearbyPlayers(prev => (JSON.stringify(prev) !== JSON.stringify(nearby) ? nearby : prev));
        } else {
           // Fallback centering
           app.stage.pivot.x = 2500 - sw / 2;
           app.stage.pivot.y = 2500 - sh / 2;
        }
      };
      app.ticker.add(tickerCallback);

      const down = (e) => (keys.current[e.key] = true);
      const up = (e) => (keys.current[e.key] = false);
      window.addEventListener("keydown", down);
      window.addEventListener("keyup", up);

      cleanupFunc = () => {
        window.removeEventListener("keydown", down);
        window.removeEventListener("keyup", up);
        app.ticker.remove(tickerCallback);
        socket.emit("leave");
      };
    };

    init();

    return () => {
      mounted = false;
      if (cleanupFunc) cleanupFunc();
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
      socket.off("current-players");
      socket.off("player-joined");
      socket.off("player-moved");
      socket.off("player-left");
      socket.off("join-success");
    };
  }, []);

  const handleExit = () => {
    socket.emit("leave");
    onExit();
  };

  return (
    <>
      <button className="exit-cosmos-btn" onClick={handleExit} style={{ zIndex: 10000 }}>
        Exit Cosmos
      </button>

      <div ref={canvasRef} style={{ width: "100%", height: "100vh", position: "fixed", inset: 0, background: "#00010a" }} />
      <Chat nearby={nearbyPlayers} localNickname={nickname} />
    </>
  );
};

export default Cosmos;