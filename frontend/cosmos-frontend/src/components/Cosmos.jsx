import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import createMarker from "./Marker";

const Cosmos = ({ avatar }) => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const app = new PIXI.Application();

      await app.init({
        resizeTo: window,
        background: "#111827",
      });

      if (!mounted || !canvasRef.current) return;

      canvasRef.current.appendChild(app.canvas);
      appRef.current = app;

      const texture = avatar
  ? await new Promise((resolve) => {
      const img = new Image();
      img.src = avatar;
      img.onload = () => {
        resolve(PIXI.Texture.from(img));
      };
    })
  : PIXI.Texture.WHITE;

      const marker = createMarker(texture);

      marker.x = 400;
      marker.y = 300;

      app.stage.addChild(marker);
    };

    init();

    return () => {
      mounted = false;

      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [avatar]);

  return <div ref={canvasRef} />;
};

export default Cosmos;