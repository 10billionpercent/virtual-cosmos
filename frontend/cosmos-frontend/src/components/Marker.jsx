import * as PIXI from "pixi.js";

const createMarker = (texture) => {
  const container = new PIXI.Container();

  const avatar = new PIXI.Sprite(texture);
  avatar.anchor.set(0.5);

  const size = 60;

  const fit = () => {
    const scale = Math.max(
      size / avatar.width,
      size / avatar.height
    );
    avatar.scale.set(scale);
  };

  if (texture.source?.resource?.width) {
    fit();
  } else {
    texture.once("update", fit);
  }

  const mask = new PIXI.Graphics()
    .circle(0, 0, 30)
    .fill(0xffffff);

  mask.resolution = window.devicePixelRatio;
  avatar.mask = mask;

  const border = new PIXI.Graphics()
    .circle(0, 0, 30)
    .stroke({ width: 3, color: 0xffffff });

  border.resolution = window.devicePixelRatio;

  const triangle = new PIXI.Graphics()
    .poly([
      -15, 20,
       15, 20,
        0, 44
    ])
    .fill(0xffffff);
 
  triangle.resolution = window.devicePixelRatio;
  container.addChild(triangle);
  container.addChild(mask);
  container.addChild(avatar);
  container.addChild(border);

  return container;
};

export default createMarker;