import * as PIXI from "pixi.js";

const createMarker = (texture) => {
  const container = new PIXI.Container();

  // 1. Proximity Glow (Background)
  const glow = new PIXI.Graphics()
    .circle(0, 0, 40)
    .fill({ color: 0x3b82f6, alpha: 0.4 });
  glow.visible = false;
  container.addChild(glow);

  // 2. Pin Point (Behind the circle)
  const triangle = new PIXI.Graphics()
    .poly([-15, 20, 15, 20, 0, 44])
    .fill({ color: 0xffffff });
  container.addChild(triangle);

  // 3. Avatar Base & Sprite
  const avatar = new PIXI.Sprite(texture);
  avatar.anchor.set(0.5);
  const size = 60;

  const fit = () => {
    const w = avatar.width || 1;
    const h = avatar.height || 1;
    const scale = Math.max(size / w, size / h);
    avatar.scale.set(Math.min(scale, 10));
  };

  if (texture.source?.resource?.width) {
    fit();
  } else {
    texture.once("update", fit);
  }

  const mask = new PIXI.Graphics()
    .circle(0, 0, 30)
    .fill({ color: 0xffffff });
  avatar.mask = mask;
  container.addChild(mask);
  container.addChild(avatar);

  // 3. High Visibility Border
  const border = new PIXI.Graphics()
    .circle(0, 0, 30)
    .stroke({ width: 4, color: 0xffffff });
  container.addChild(border);

  // 4. Nickname Label
  const style = new PIXI.TextStyle({
    fontFamily: 'sans-serif',
    fontSize: 16,
    fontWeight: 'bold',
    fill: 0xffffff,
    stroke: { color: 0x000000, width: 4 }
  });

  const nameLabel = new PIXI.Text({ text: "Explorer", style });
  nameLabel.anchor.set(0.5);
  nameLabel.y = -55;
  container.addChild(nameLabel);

  // Helper Methods
  container.setNickname = (name) => {
    nameLabel.text = name;
  };

  container.setAvatar = (newTexture) => {
    avatar.texture = newTexture;
    fit();
  };

  container.setHighlight = (active) => {
    glow.visible = active;
    if (active) {
      border.clear().circle(0,0,30).stroke({ width: 4, color: 0x3b82f6 });
      triangle.clear().poly([-15, 20, 15, 20, 0, 44]).fill({ color: 0x3b82f6 });
    } else {
      border.clear().circle(0,0,30).stroke({ width: 4, color: 0xffffff });
      triangle.clear().poly([-15, 20, 15, 20, 0, 44]).fill({ color: 0xffffff });
    }
  };

  return container;
};

export default createMarker;