import * as PIXI from "pixi.js";

const createMarker = (texture, isLocal = false, color) => {
  const container = new PIXI.Container();

  // Parse HEX to Number for PIXI Graphics
  const tint = typeof color === 'string' ? parseInt(color.replace('#', '0x')) : (isLocal ? 0x3b82f6 : 0xffffff);

  // 1. Proximity Glow (More diffused and gentle)
  const glow = new PIXI.Graphics()
    .circle(0, 0, 45).fill({ color: tint, alpha: 0.15 })
    .circle(0, 0, 55).fill({ color: tint, alpha: 0.1 })
    .circle(0, 0, 65).fill({ color: tint, alpha: 0.05 });
  glow.visible = false;
  container.addChild(glow);

  // 2. Pin Point - Different color for YOU vs OTHERS
  // Blue for the user themselves, White for strangers.
  const triangle = new PIXI.Graphics()
    .poly([-15, 20, 15, 20, 0, 44])
    .fill({ color: tint });
  container.addChild(triangle);

  // 3. Avatar
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

  // 3. Border
  const border = new PIXI.Graphics()
    .circle(0, 0, 30)
    .stroke({ width: 4, color: tint });
  container.addChild(border);

  // 4. Nickname Label
  const style = new PIXI.TextStyle({
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 16,
    fontWeight: '800',
    fill: 0xffffff,
    stroke: { color: 0x000000, width: 4 }
  });

  const nameLabel = new PIXI.Text({ text: isLocal ? "You" : "Explorer", style });
  nameLabel.anchor.set(0.5);
  nameLabel.y = -55;
  container.addChild(nameLabel);

  // Helper Methods
  container.setNickname = (name) => {
    nameLabel.text = isLocal ? `${name} (You)` : name;
  };

  container.setAvatar = (newTexture) => {
    avatar.texture = newTexture;
    fit();
  };

  container.setHighlight = (active) => {
    glow.visible = active;
    // Boost border width when highlighted
    if (active) {
      border.clear().circle(0,0,30).stroke({ width: 6, color: tint });
    } else {
      border.clear().circle(0,0,30).stroke({ width: 4, color: tint });
    }
  };

  return container;
};

export default createMarker;